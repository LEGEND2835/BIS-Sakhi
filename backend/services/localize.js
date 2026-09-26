const { translateToLanguage } = require("./translate");

const LANGUAGE_MAP = {
  english: "en",
  hindi: "hi",
  kannada: "kn",
  telugu: "te",
  tamil: "ta",
  bengali: "bn",
  marathi: "mr",
  malayalam: "ml",
  en: "en",
  hi: "hi",
  kn: "kn",
  te: "te",
  ta: "ta",
  bn: "bn",
  mr: "mr",
  ml: "ml",
};

async function localizeResponse(response, language) {
  const normalizedLanguage =
  typeof language === "string"
    ? language.trim().toLowerCase()
    : "en";

  const targetLanguage =
    LANGUAGE_MAP[normalizedLanguage] || "en";

  // English needs no translation.
  if (targetLanguage === "en") {
    return response;
  }

  const localized = { ...response };

  // Hallmarking response
  if (localized.hallmarking?.answer) {
    const translated = await translateToLanguage(
      localized.hallmarking.answer,
      targetLanguage
    );

    if (translated.verified) {
      localized.hallmarking = {
        ...localized.hallmarking,
        answer: translated.text,
      };
    }
  }

  // User-facing abstention messages
  if (localized.message) {
    const translated = await translateToLanguage(
      localized.message,
      targetLanguage
    );

    if (translated.verified) {
      localized.message = translated.text;
    }
  }

  if (localized.next_step) {
    const translated = await translateToLanguage(
      localized.next_step,
      targetLanguage
    );

    if (translated.verified) {
      localized.next_step = translated.text;
    }
  }

  // Normal compliance response
  if (localized.compliance_pathway) {
    const pathway = localized.compliance_pathway;

    if (Array.isArray(pathway.next_steps)) {
      const translatedSteps = [];

      for (const step of pathway.next_steps) {
        const translated = await translateToLanguage(
          step,
          targetLanguage
        );

        translatedSteps.push(
          translated.verified ? translated.text : step
        );
      }

      localized.compliance_pathway = {
        ...pathway,
        next_steps: translatedSteps,
      };
    }
  }

  // Product-specific warnings
  if (Array.isArray(localized.warnings)) {
    const translatedWarnings = [];

    for (const warning of localized.warnings) {
      const translated = await translateToLanguage(
        warning,
        targetLanguage
      );

      translatedWarnings.push(
        translated.verified ? translated.text : warning
      );
    }

    localized.warnings = translatedWarnings;
  }

  return localized;
}

module.exports = {
  localizeResponse,
  LANGUAGE_MAP,
};