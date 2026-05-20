import { GoogleGenerativeAI } from "@google/generative-ai";
import "./env.js";

const apiKey = process.env.GOOGLE_API_KEY;
// Do not spam logs when API key is missing. We'll silently disable Gemini and
// return a safe fallback from `askGemini`. This avoids noisy PM2 logs and
// prevents crashes when the key isn't provided.
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const MODEL_NAME = "gemini-1.5-flash";

export function isGeminiConfigured() {
  return Boolean(genAI);
}

export async function askGemini(prompt, systemPrompt) {
  if (!genAI) {
    // GOOGLE_API_KEY yo'q bo'lsa, xato tashlash o'rniga fallback javob qaytaramiz
    return {
      reply: "AI xizmati hozircha mavjud emas. Iltimos, keyinroq urinib ko'ring.",
      tokensUsed: 0,
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: systemPrompt || undefined,
    });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = result.response.text();
    const tokensUsed = Math.round(text.length / 4);

    return { reply: text, tokensUsed };
  } catch (error) {
    // Log the error for debugging but return a safe fallback so callers don't
    // crash or propagate unexpected exceptions. This keeps the API resilient
    // if Gemini calls fail at runtime.
    console.error("[Gemini] Error:", error?.message || error);
    return {
      reply: "AI xizmati hozircha mavjud emas yoki xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.",
      tokensUsed: 0,
    };
  }
}
