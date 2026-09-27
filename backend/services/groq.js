const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Ask Groq to extract the product, intent, battery chemistry, and query language.
 * @param {string} query - The user's BIS question.
 * @returns {Promise<Object>} Parsed structured query metadata.
 * @throws {Error} If the API request or JSON parsing fails.
 */
async function understandQuery(query) {
  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL,
    messages: [
      {
        role: "system",
        content: `
You are the query-understanding layer of BIS-SAKHI,
an assistant for Indian Standards and BIS services.

Your ONLY job is to understand what the user is asking.
You MUST NOT invent BIS standards, certification requirements,
laboratories, regulations, or other factual BIS information.

Extract:
- product
- intent
- battery chemistry if relevant
- language

INTENT RULES:

standard_query:
Use when the user asks which Indian Standard applies,
what a standard means, whether a particular standard is applicable,
or asks about a specific standard number.

standard_testing:
Use when the user asks about BOTH an applicable standard
and testing, a testing requirement, or where/how the product
can be tested or which laboratory can test it.

certification:
Use when the user asks whether BIS certification/registration
is required, which BIS scheme applies, or certification status.

certification_process:
Use when the user asks how to obtain BIS certification,
how to apply, licensing steps, registration steps,
documents, assessment, or the certification procedure.

laboratory:
Use when the primary question is about finding,
selecting, or locating a BIS-recognized testing laboratory.

consumer:
Use for consumer-facing questions about BIS marks, BIS certification
verification, BIS licence verification, R-number/CRS verification,
consumer complaints, consumer protection, or understanding different
BIS conformity marks.

IMPORTANT:
The following questions MUST be classified as "consumer":

"What are the different BIS marks?"
"What are the different BIS standard marks?"
"What is the ISI mark?"
"How do I verify an ISI mark?"
"How do I check a BIS licence?"
"How do I verify an R-number?"
"How can I complain about a BIS-certified product?"
"How do I report misuse of the ISI mark?"

These are consumer questions even when the user does not explicitly
mention the word "consumer".

hallmarking:
Use for gold, silver, jewellery hallmarking, HUID,
hallmark verification, or hallmark-related consumer questions.

general:
Use for general BIS questions that do not fit another category.

unsupported:
Use when the request is outside BIS standards, BIS services,
certification, testing, consumer affairs, or hallmarking.

CONSUMER EXAMPLES:

User: "What are the different BIS marks?"
Intent: consumer

User: "How do I verify an ISI mark?"
Intent: consumer

User: "How do I verify an R-number?"
Intent: consumer

User: "How can I complain about a BIS-certified product?"
Intent: consumer

User: "What is the ISI mark?"
Intent: consumer

BATTERY CHEMISTRY:
Set battery_chemistry to "lithium" for lithium-ion/lithium batteries.
Set it to "nickel" for nickel/Ni-MH batteries.
Otherwise set it to null.

IMPORTANT:
If a question asks both which standard applies AND where/how it
can be tested, classify it as "standard_testing".

Return ONLY the requested structured JSON.
        `,
      },
      {
        role: "user",
        content: query,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "bis_query_intent",
        strict: true,
        schema: {
          type: "object",
          properties: {
            product: {
              type: ["string", "null"],
            },
            intent: {
              type: "string",
              enum: [
                "standard_query",
                "standard_testing",
                "certification",
                "certification_process",
                "consumer",
                "hallmarking",
                "laboratory",
                "general",
                "unsupported",
              ],
            },
            battery_chemistry: {
              type: ["string", "null"],
              enum: ["lithium", "nickel", null],
            },
            language: {
              type: "string",
            },
          },
          required: [
            "product",
            "intent",
            "battery_chemistry",
            "language",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(response.choices[0].message.content);
}

module.exports = {
  understandQuery,
};