const express = require("express");
const db = require("../config/db");
const { understandQuery } = require("../services/groq");

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

    // ---------------------------------------------------------
    // Call Groq query-understanding service
    // ---------------------------------------------------------
    let aiIntent = null;
    try {
      const rawAiResult = await understandQuery(query);
      if (rawAiResult && typeof rawAiResult === "object") {
        aiIntent = {
          product: rawAiResult.product ?? null,
          intent: rawAiResult.intent ?? null,
          battery_chemistry: rawAiResult.battery_chemistry ?? null,
          language: rawAiResult.language ?? null
        };
      }
    } catch (groqError) {
      console.warn(
        "Groq query understanding unavailable, falling back to deterministic detection:",
        groqError.message
      );
      aiIntent = null;
    }

    const text = query.toLowerCase();

    // ---------------------------------------------------------
    // 1. Detect battery chemistry (AI hint with deterministic fallback)
    // ---------------------------------------------------------
    let batteryChemistry = null;

    if (
      aiIntent &&
      (aiIntent.battery_chemistry === "lithium" ||
        aiIntent.battery_chemistry === "nickel")
    ) {
      batteryChemistry = aiIntent.battery_chemistry;
    } else if (
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
    // 1A. Hallmarking guidance
    // ---------------------------------------------------------
    if (aiIntent && aiIntent.intent === "hallmarking") {
      const hallmarkResult = await db.query(
        `
        SELECT
          hg.topic,
          hg.question_pattern,
          hg.answer,
          s.name AS source_name,
          s.url AS source_url
        FROM hallmarking_guidance hg
        LEFT JOIN sources s
          ON s.id = hg.source_id
        ORDER BY hg.id;
        `
      );

      // Ignore generic conversational words.
      const stopWords = new Set([
        "how", "what", "where", "when", "why",
        "can", "could", "would", "should",
        "do", "does", "did",
        "i", "my", "me", "the", "a", "an",
        "is", "are", "to", "for", "of",
        "on", "in", "and", "or", "with"
      ]);

      const queryWords = new Set(
        query
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, " ")
          .split(/\s+/)
          .filter(word => word.length >= 3 && !stopWords.has(word))
      );

      let bestMatch = null;
      let bestScore = 0;

      for (const row of hallmarkResult.rows) {
        const patterns = row.question_pattern
          .split(";")
          .map(pattern => pattern.trim());

        for (const pattern of patterns) {
          const patternWords = pattern
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, " ")
            .split(/\s+/)
            .filter(word => word.length >= 3 && !stopWords.has(word));

          let score = 0;

          for (const word of patternWords) {
            if (queryWords.has(word)) {
              score++;
            }
          }

          if (score > bestScore) {
            bestScore = score;
            bestMatch = row;
          }
        }
      }

      if (bestMatch && bestScore >= 2) {
        return res.json({
          status: "success",
          query,
          detected_product: null,
          confidence: 0.95,
          abstained: false,
          intent: "hallmarking",
          hallmarking: {
            topic: bestMatch.topic,
            answer: bestMatch.answer,
            source: bestMatch.source_url
              ? {
                  name: bestMatch.source_name,
                  url: bestMatch.source_url
                }
              : null
          },
          ai_intent: aiIntent
        });
      }

      return res.json({
        status: "success",
        query,
        detected_product: null,
        confidence: 0,
        abstained: true,
        intent: "hallmarking",
        message:
          "I could not find a verified Hallmarking answer for that question.",
        next_step:
          "Please ask about HUID, hallmark verification, jewellery testing, jeweller registration, or another specific Hallmarking topic.",
        ai_intent: aiIntent
      });
    }

    // ---------------------------------------------------------
    // 2. Detect product from verified database
    //    (AI product hint primary, deterministic query fallback)
    // ---------------------------------------------------------
    let matchedProduct = null;

    if (aiIntent && aiIntent.product && typeof aiIntent.product === "string") {
      const aiProduct = aiIntent.product.toLowerCase().trim();
      const aiProductResult = await db.query(
        `
        SELECT id, name, category, keywords
        FROM products
        WHERE keywords IS NOT NULL
          AND (
            $1 ILIKE '%' || name || '%'
            OR name ILIKE '%' || $1 || '%'
            OR EXISTS (
              SELECT 1
              FROM unnest(keywords) AS keyword
              WHERE $1 ILIKE '%' || keyword || '%'
                 OR keyword ILIKE '%' || $1 || '%'
            )
          )
        ORDER BY array_length(keywords, 1) DESC
        LIMIT 1;
        `,
        [aiProduct]
      );

      if (aiProductResult.rows.length > 0) {
        matchedProduct = aiProductResult.rows[0];
      }
    }

    // Fallback: existing deterministic database detection using raw query text
    if (!matchedProduct) {
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

      matchedProduct = productResult.rows[0] || null;
    }

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
          "Please describe the product more specifically.",
        ai_intent: aiIntent
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
        message: "No verified compliance information was found.",
        ai_intent: aiIntent
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
      ),

      ai_intent: aiIntent
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;