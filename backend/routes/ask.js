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

    // MVP product detection
    let productName = null;

    if (
         text.includes("helmet") ||
         text.includes("motorcycle helmet") ||
        text.includes("bike helmet")
    ) {
         productName = "Motorcycle Helmet";
    } else if (
         text.includes("packaged drinking water") ||
        text.includes("packaged water") ||
        text.includes("bottled drinking water")
    ) {
         productName = "Packaged Drinking Water";
    }

    // Safe abstention when product is not in our verified corpus
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

    // Retrieve verified compliance information
    const result = await db.query(
      `
      SELECT
        p.name AS product,
        p.category,
        s.standard_number,
        s.title,
        s.status,
        s.year,
        l.lab_name,
        l.lab_code,
        src.url AS source_url
      FROM products p
      JOIN product_standards ps
        ON p.id = ps.product_id
      JOIN standards s
        ON s.id = ps.standard_id
      LEFT JOIN lab_scopes ls
        ON ls.standard_id = s.id
      LEFT JOIN labs l
        ON l.id = ls.lab_id
      LEFT JOIN sources src
        ON src.id = s.source_id
      WHERE p.name = $1
      ORDER BY l.lab_name;
      `,
      [productName]
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

    const first = result.rows[0];

    const laboratories = result.rows
      .filter(row => row.lab_name)
      .map(row => ({
        name: row.lab_name,
        code: row.lab_code
      }));

    res.json({
      status: "success",

      query,

      detected_product: {
        name: first.product,
        category: first.category
      },

      confidence: 0.98,
      abstained: false,

      compliance_pathway: {
        standard: {
          number: first.standard_number,
          title: first.title,
          year: first.year,
          status: first.status
        },

        certification: {
          status: "information_not_yet_loaded",
          message:
            "Certification scheme data will be added from verified BIS sources."
        },

        testing: {
          available: laboratories.length > 0,
          laboratories
        },

        next_steps: [
          "Verify the current applicable BIS requirements.",
          "Check the applicable certification scheme/product manual.",
          "Use a BIS-recognized laboratory with the relevant testing scope.",
          "Proceed with BIS certification requirements where applicable."
        ]
      },

      warnings:
        productName === "Motorcycle Helmet"
            ? [
                "IS 4151:1993 is withdrawn.",
                "Use the current IS 4151:2015 record."
            ]
            : [],

      evidence: [
        {
          type: "BIS standard",
          standard: first.standard_number,
          source: first.source_url
        }
      ]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;