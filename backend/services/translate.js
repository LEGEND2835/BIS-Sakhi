require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

const SUPPORTED_LANGUAGES = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
  te: "Telugu",
  ta: "Tamil",
  bn: "Bengali",
  mr: "Marathi",
  ml: "Malayalam",
};

const HINDI_GLOSSARY = {
  "Indian Standard": "भारतीय मानक",
  certification: "प्रमाणीकरण",
  "certification scheme": "प्रमाणीकरण योजना",
  "testing laboratory": "परीक्षण प्रयोगशाला",
  standard: "मानक",
  applicable: "लागू",
  requirement: "आवश्यकता",
  withdrawn: "वापस लिया गया",
  mandatory: "अनिवार्य",
  registration: "पंजीकरण",
  licence: "लाइसेंस",
  jeweller: "जौहरी",
  hallmarking: "हॉलमार्किंग",
  consumer: "उपभोक्ता",
  product: "उत्पाद",
  testing: "परीक्षण",
  laboratory: "प्रयोगशाला",
  verification: "सत्यापन",
  "official source": "आधिकारिक स्रोत",
  "next steps": "अगले चरण",
};

function protectEntities(text) {
  const entities = [];

  const patterns = [
    /\bIS\s+\d+(?:\s*\([^)]*\))?:\d{4}\b/g,
    /\bScheme-(?:I|II)\b/g,
    /\b(?:HUID|CRS|QCO|BIS|ISI|AHC)\b/g,
    /\bR[- ]?Number\b/gi,
    /https?:\/\/[^\s)]+/g,
  ];

  let protectedText = text;

  for (const pattern of patterns) {
    protectedText = protectedText.replace(pattern, (match) => {
      const token = `__ENT_${entities.length + 1}__`;

      entities.push({
        token,
        value: match,
      });

      return token;
    });
  }

  return {
    protectedText,
    entities,
  };
}

function restoreEntities(text, entities) {
  let restored = text;

  for (const entity of entities) {
    restored = restored.split(entity.token).join(entity.value);
  }

  return restored;
}

function verifyEntities(original, translated) {
  const { entities } = protectEntities(original);

  for (const entity of entities) {
    if (!translated.includes(entity.value)) {
      return {
        valid: false,
        missing: entity.value,
      };
    }
  }

  return {
    valid: true,
    missing: null,
  };
}

function buildGlossary(language) {
  if (language === "hi") {
    return Object.entries(HINDI_GLOSSARY)
      .map(([english, hindi]) => `${english} → ${hindi}`)
      .join("\n");
  }

  return `
Use natural, standard ${SUPPORTED_LANGUAGES[language]} terminology.
Keep BIS technical terms and acronyms in their original form.
Do not invent translations for official identifiers.
`;
}

async function translateToLanguage(text, language) {
  if (!text || !text.trim()) {
    return {
      text,
      verified: true,
      reason: null,
    };
  }

  if (language === "en") {
    return {
      text,
      verified: true,
      reason: null,
    };
  }

  if (!SUPPORTED_LANGUAGES[language]) {
    return {
      text,
      verified: false,
      reason: `Unsupported language: ${language}`,
    };
  }

  const {
    protectedText,
    entities,
  } = protectEntities(text);

  const glossary = buildGlossary(language);

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
You translate short BIS-SAKHI response text from English to ${SUPPORTED_LANGUAGES[language]}.

STRICT RULES:

1. Translate only the surrounding prose.
2. Do not add information.
3. Do not remove information.
4. Do not reinterpret the meaning.
5. Do not strengthen or weaken any requirement.
6. Copy every placeholder exactly.
7. Keep BIS technical acronyms and official identifiers unchanged.
8. Do not translate URLs.
9. Do not translate standards, scheme names, identifiers, or numbers represented by placeholders.
10. Do not explain the answer.
11. Return only the translated text.

Approved terminology guidance:
${glossary}
        `.trim(),
      },
      {
        role: "user",
        content: protectedText,
      },
    ],
  });

  const translated = completion.choices[0]?.message?.content?.trim();

  if (!translated) {
    return {
      text,
      verified: false,
      reason: "Translation returned an empty response.",
    };
  }

  const restored = restoreEntities(translated, entities);

  const verification = verifyEntities(
    text,
    restored
  );

  if (!verification.valid) {
    return {
      text,
      verified: false,
      reason: `Protected entity missing: ${verification.missing}`,
    };
  }

  return {
    text: restored,
    verified: true,
    reason: null,
  };
}

module.exports = {
  translateToLanguage,
  SUPPORTED_LANGUAGES,
};