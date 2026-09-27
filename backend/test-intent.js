require("dotenv").config();

const { understandQuery } = require("./services/groq");

/**
 * Run sample helmet and battery questions through Groq and log intent or errors.
 */
async function test() {
  const queries = [
    "I manufacture motorcycle helmets. What BIS standard applies and where can I get it tested?",
    "Can I use IS 4151:1993 for my helmet?",
    "I have a lithium ion battery. Which BIS standard applies?"
  ];

  for (const query of queries) {
    console.log("\nUSER:", query);

    try {
      const result = await understandQuery(query);
      console.log("AI INTENT:");
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("FAILED:", error.message);
    }
  }
}

test();