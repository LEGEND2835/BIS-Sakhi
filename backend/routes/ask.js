const express = require("express");
const db = require("../config/db");
const { understandQuery } = require("../services/groq");
const { localizeResponse } = require("../services/localize");

const router = express.Router();

/**
 * Send localized JSON, falling back to the original response if localization fails.
 * @param {import("express").Response} res - Response used to send the JSON body.
 * @param {Object} response - Original guidance payload.
 * @param {string} language - Requested language name or code.
 * @returns {Promise<import("express").Response>} The sent response.
 */
async function sendLocalizedResponse(res, response, language) {
  try {
    const localized = await localizeResponse(response, language);
    return res.json(localized);
  } catch (error) {
    console.warn(
      "Localization failed, returning original response:",
      error.message
    );

    return res.json(response);
  }
}

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

      // Prioritize HUID verification queries, including Hindi/Hinglish
      // and other multilingual queries containing stable HUID/check terms.
      const huidVerificationQuery =
        /\bhuid\b/i.test(query) &&
        /\b(check|verify|verification|genuine|validate|authenticate|kaise|kare|karein|karu|कैसे|करें|करना|जांच|सत्यापन)\b/i.test(
          query
        );

      if (huidVerificationQuery) {
        bestMatch = hallmarkResult.rows.find(
          row => row.topic === "huid_verification"
        );
        bestScore = bestMatch ? 2 : 0;
      }

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
        return sendLocalizedResponse(
          res,
          {
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
          },
          aiIntent?.language
        );
      }

      return sendLocalizedResponse(
        res,
        {
          status: "success",
          query,
          detected_product: null,
          confidence: 0,
          abstained: true,
          intent: "hallmarking",
          message: "I could not find verified BIS hallmarking guidance for that query.",
          next_step:
            "Please ask about HUID, hallmark verification, jeweller registration, or hallmarking.",
          ai_intent: aiIntent
        },
        aiIntent?.language
      );
    }

    // Consumer guidance
    if (
      aiIntent &&
      aiIntent.intent === "consumer"
    ) {
      const consumerResult = await db.query(
        `
        SELECT
          id,
          topic,
          question_pattern,
          answer,
          source_url
        FROM consumer_guidance
        ORDER BY id;
        `
      );

      const stopWords = new Set([
        "how",
        "do",
        "i",
        "can",
        "the",
        "a",
        "an",
        "is",
        "are",
        "to",
        "about",
        "what",
        "for",
        "my",
        "me",
        "please",
        "bis"
      ]);

      const queryWords = query
        .toLowerCase()
        .split(/[^a-z0-9-]+/)
        .filter(word => word.length > 1 && !stopWords.has(word));

      let bestMatch = null;
      let bestScore = 0;

      for (const row of consumerResult.rows) {
        const patterns = row.question_pattern
          .toLowerCase()
          .split(";")
          .map(pattern =>
            pattern
              .split(/[^a-z0-9-]+/)
              .filter(Boolean)
          );

        let score = 0;

        for (const patternWords of patterns) {
          const matches = patternWords.filter(word =>
            queryWords.includes(word)
          ).length;

          score = Math.max(score, matches);
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = row;
        }
      }

      if (bestMatch && bestScore >= 2) {
        return sendLocalizedResponse(
          res,
          {
            status: "success",
            query,
            detected_product: null,
            confidence: Math.min(0.95, 0.65 + bestScore * 0.1),
            abstained: false,
            intent: "consumer",
            consumer_guidance: {
              topic: bestMatch.topic,
              answer: bestMatch.answer,
              source: bestMatch.source_url
                ? {
                    url: bestMatch.source_url
                  }
                : null
            },
            ai_intent: aiIntent
          },
          aiIntent?.language
        );
      }

      return sendLocalizedResponse(
        res,
        {
          status: "success",
          query,
          detected_product: null,
          confidence: 0,
          abstained: true,
          intent: "consumer",
          message:
            "I could not find verified BIS consumer guidance for that query.",
          next_step:
            "Please ask about ISI mark verification, R-number verification, BIS complaints, or BIS standard marks.",
          ai_intent: aiIntent
        },
        aiIntent?.language
      );
    }

    // ---------------------------------------------------------
    // 2. Certification process guidance
    // ---------------------------------------------------------
    if (
      aiIntent &&
      aiIntent.intent === "certification_process"
    ) {
      const certificationResult = await db.query(
        `
        SELECT
          cp.step_order,
          cp.title,
          cp.description,
          cp.source_url,
          s.name AS source_name
        FROM certification_process cp
        LEFT JOIN sources s
          ON s.id = cp.source_id
        WHERE cp.topic = 'product_certification'
        ORDER BY cp.step_order;
        `
      );

      if (certificationResult.rows.length > 0) {
        return sendLocalizedResponse(
          res,
          {
            status: "success",
            query,
            detected_product: aiIntent.product || null,
            confidence: 0.95,
            abstained: false,
            intent: "certification_process",
            certification_process:
              certificationResult.rows.map(row => ({
                step: row.step_order,
                title: row.title,
                description: row.description,
                source: row.source_url
                  ? {
                      name: row.source_name,
                      url: row.source_url
                    }
                  : null
              })),
            ai_intent: aiIntent
          },
          aiIntent?.language
        );
      }

      return sendLocalizedResponse(
        res,
        {
          status: "success",
          query,
          detected_product: aiIntent.product || null,
          confidence: 0,
          abstained: true,
          intent: "certification_process",
          message:
            "I could not find a verified BIS certification process for that query.",
          next_step:
            "Please ask about BIS product certification or specify the product you want to certify.",
          ai_intent: aiIntent
        },
        aiIntent?.language
      );
    }


    // ---------------------------------------------------------
    // 3. Detect product from verified database
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
    // 4. Safe abstention
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
    // 5. Retrieve standards + certification + labs + evidence
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
    // 4A. Retrieve verified evidence for matched standards
    // ---------------------------------------------------------
    const standardIds = [
      ...new Set(
        result.rows
          .map(row => row.standard_id)
          .filter(Boolean)
      )
    ];

    let evidenceRows = [];

    if (standardIds.length > 0) {
      const evidenceResult = await db.query(
        `
        SELECT
          e.id AS evidence_id,
          e.standard_id,
          e.evidence_type,
          s.standard_number,
          src.name AS source_name,
          src.url AS source_url,
          e.reference_text,
          e.clause_reference,
          e.page_number,
          e.section_title
        FROM evidence e
        LEFT JOIN standards s
          ON s.id = e.standard_id
        LEFT JOIN sources src
          ON src.id = e.source_id
        WHERE e.standard_id = ANY($1::int[])
        ORDER BY e.id;
        `,
        [standardIds]
      );

      evidenceRows = evidenceResult.rows;
    }

    // ---------------------------------------------------------
    // 6. Build standards
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
    // Attach verified database evidence to each standard
    // ---------------------------------------------------------
    for (const evidence of evidenceRows) {
      const standard = standardsMap.get(evidence.standard_id);

      if (!standard) continue;

      standard.evidence.push({
        id: evidence.evidence_id,
        type: evidence.evidence_type,
        standard: evidence.standard_number,
        source_name: evidence.source_name,
        source: evidence.source_url,
        reference: evidence.reference_text,
        clause_reference: evidence.clause_reference,
        page_number: evidence.page_number,
        section_title: evidence.section_title
      });
    }

    // ---------------------------------------------------------
    // 7. Product-specific warnings
    // ---------------------------------------------------------
    let warnings = [];

    if (productName === "Motorcycle Helmet") {
      warnings = [
        "IS 4151:1993 is withdrawn.",
        "Use the current IS 4151:2015 record."
      ];
    }

    // ---------------------------------------------------------
    // 8. Build certification summary
    // ---------------------------------------------------------
    const certifications = standards.map(standard => ({
      standard: standard.number,
      ...standard.certification
    }));

    // ---------------------------------------------------------
    // 9. Response
    // ---------------------------------------------------------
    return sendLocalizedResponse(
      res,
      {
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
      },
      aiIntent?.language
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
