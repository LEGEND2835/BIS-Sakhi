require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function test() {
  try {
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL,
      messages: [
        {
          role: "user",
          content: "Reply with exactly: BIS-SAKHI Groq connection successful"
        }
      ],
    });

    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error("Groq test failed:");
    console.error(error.message);
  }
}

test();