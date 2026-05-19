import { GoogleGenerativeAI } from "@google/generative-ai";
import "./env.js";

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.warn(
    "[Gemini] GOOGLE_API_KEY topilmadi. /api/ai endpointlari fallback javoblardan foydalanadi."
  );
}

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
    console.error("[Gemini] Error:", error);
    throw new Error("Gemini bilan so'rovda xato yuz berdi.");
  }
}
