const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        status: "error",
        message: "Query is required."
      });
    }

    const text = query.toLowerCase();

    // ---------------------------------------------------------
    // 1. Detect battery chemistry
    // ---------------------------------------------------------
    let batteryChemistry = null;

    if (
      text.includes("lithium") ||
      text.includes("li-ion") ||
      text.includes("li ion") ||
      text.includes("lithium-ion")
    ) {
      batteryChemistry = "lithium";
    } else if (
      text.includes("nickel") ||
      text.includes("ni-mh") ||
      text.includes("nimh")
    ) {
      batteryChemistry = "nickel";
    }

    // ---------------------------------------------------------
    // 2. Detect product from verified database keywords
    // ---------------------------------------------------------
    const productResult = await db.query(
      `
      SELECT id, name, category, keywords
      FROM products
      WHERE keywords IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM unnest(keywords) AS keyword
          WHERE $1 ILIKE '%' || keyword || '%'
        )
      ORDER BY array_length(keywords, 1) DESC
      LIMIT 1;
      `,
      [text]
    );

    const matchedProduct = productResult.rows[0] || null;
    const productName = matchedProduct
      ? matchedProduct.name
      : null;

    // ---------------------------------------------------------
    // 3. Safe abstention
    // ---------------------------------------------------------
    if (!productName) {
      return res.json({
        status: "success",
        detected_product: null,
        confidence: 0,
        abstained: true,
        message:
          "I could not confidently identify a product covered by my verified BIS-SAKHI knowledge base.",
        next_step:
          "Please describe the product more specifically."
      });
    }

    // ---------------------------------------------------------
    // 4. Retrieve standards + certification + labs + evidence
    // ---------------------------------------------------------
    const result = await db.query(
      `
      SELECT
        p.name AS product,
        p.category,

        s.id AS standard_id,
        s.standard_number,
        s.title,
        s.status,
        s.year,

        l.lab_name,
        l.lab_code,

        standard_src.url AS standard_source_url,

        cs.name AS certification_scheme,
        cs.scheme_code,
        pc.requirement_status,
        pc.description AS certification_description,
        cert_src.url AS certification_source_url

      FROM products p

      JOIN product_standards ps
        ON p.id = ps.product_id

      JOIN standards s
        ON s.id = ps.standard_id

      LEFT JOIN lab_scopes ls
        ON ls.standard_id = s.id

      LEFT JOIN labs l
        ON l.id = ls.lab_id

      LEFT JOIN sources standard_src
        ON standard_src.id = s.source_id

      LEFT JOIN product_certifications pc
        ON pc.product_id = p.id
        AND pc.standard_id = s.id

      LEFT JOIN certification_schemes cs
        ON cs.id = pc.scheme_id

      LEFT JOIN sources cert_src
        ON cert_src.id = pc.source_id

      WHERE p.name = $1

        AND (
          $2::text IS NULL

          OR (
            $2 = 'lithium'
            AND s.standard_number = 'IS 16046 (Part 2):2018'
          )

          OR (
            $2 = 'nickel'
            AND s.standard_number = 'IS 16046 (Part 1):2018'
          )
        )

      ORDER BY
        s.standard_number,
        l.lab_name;
      `,
      [productName, batteryChemistry]
    );

    if (result.rows.length === 0) {
      return res.json({
        status: "success",
        detected_product: productName,
        confidence: 0,
        abstained: true,
        message: "No verified compliance information was found."
      });
    }

    // ---------------------------------------------------------
    // 5. Build standards
    // ---------------------------------------------------------
    const standardsMap = new Map();

    for (const row of result.rows) {
      if (!standardsMap.has(row.standard_id)) {
        standardsMap.set(row.standard_id, {
          number: row.standard_number,
          title: row.title,
          year: row.year,
          status: row.status,

          certification: row.certification_scheme
            ? {
                scheme: row.certification_scheme,
                scheme_code: row.scheme_code,
                requirement_status: row.requirement_status,
                description: row.certification_description,
                source: row.certification_source_url || null
              }
            : {
                scheme: null,
                scheme_code: null,
                requirement_status: "not_loaded",
                description: "Certification information is not available.",
                source: null
              },

          laboratories: [],

          evidence: []
        });

        // Add standard evidence
        if (row.standard_source_url) {
          standardsMap.get(row.standard_id).evidence.push({
            type: "BIS standard",
            standard: row.standard_number,
            source: row.standard_source_url
          });
        }

        // Add certification evidence
        if (row.certification_source_url) {
          standardsMap.get(row.standard_id).evidence.push({
            type: "BIS certification",
            standard: row.standard_number,
            source: row.certification_source_url
          });
        }
      }

      const standard = standardsMap.get(row.standard_id);

      // -------------------------------------------------------
      // Add laboratory only when one exists
      // -------------------------------------------------------
      if (row.lab_name) {
        const alreadyAdded = standard.laboratories.some(
          lab =>
            lab.code === row.lab_code &&
            lab.name === row.lab_name
        );

        if (!alreadyAdded) {
          standard.laboratories.push({
            name: row.lab_name,
            code: row.lab_code
          });
        }
      }
    }

    const standards = Array.from(standardsMap.values());

    // ---------------------------------------------------------
    // 6. Product-specific warnings
    // ---------------------------------------------------------
    let warnings = [];

    if (productName === "Motorcycle Helmet") {
      warnings = [
        "IS 4151:1993 is withdrawn.",
        "Use the current IS 4151:2015 record."
      ];
    }

    // ---------------------------------------------------------
    // 7. Build certification summary
    // ---------------------------------------------------------
    const certifications = standards.map(standard => ({
      standard: standard.number,
      ...standard.certification
    }));

    // ---------------------------------------------------------
    // 8. Response
    // ---------------------------------------------------------
    res.json({
      status: "success",

      query,

      detected_product: {
        name: result.rows[0].product,
        category: result.rows[0].category
      },

      confidence: 0.98,
      abstained: false,

      compliance_pathway: {
        standards,

        certification: certifications,

        next_steps: [
          "Verify the current applicable BIS requirements.",
          "Check the applicable certification scheme/product manual.",
          "Use a BIS-recognized laboratory with the relevant testing scope.",
          "Proceed with BIS certification requirements where applicable."
        ]
      },

      warnings,

      evidence: standards.flatMap(
        standard => standard.evidence
      )
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;