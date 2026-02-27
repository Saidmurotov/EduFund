import { askGemini } from "../lib/gemini.js";
import { db } from "../lib/firebase-admin.js";

function monthDiff(from, to) {
  const f = new Date(from);
  const t = new Date(to);
  if (Number.isNaN(f.getTime()) || Number.isNaN(t.getTime())) return 3;
  const months =
    (t.getFullYear() - f.getFullYear()) * 12 + (t.getMonth() - f.getMonth());
  return Math.max(1, months);
}

function extractJson(text) {
  const s = String(text || "");
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return s.slice(start, end + 1);
}

export async function chatWithAi(req, res) {
  try {
    const { message, userId, conversationHistory } = req.body || {};

    if (!message || !userId) {
      return res
        .status(400)
        .json({ message: "message va userId majburiy maydonlar." });
    }

    const systemPrompt =
      "Sen EduFund AI maslahatchi. Faqat grantlar, stipendiyalar, xorijda o'qish haqida javob ber.";

    const historyText =
      Array.isArray(conversationHistory) && conversationHistory.length
        ? "\n\nSuhbat tarixi:\n" +
          conversationHistory
            .map((m) => `${String(m.role).toUpperCase()}: ${m.content}`)
            .join("\n")
        : "";

    const { reply, tokensUsed } = await askGemini(
      `Foydalanuvchi ID: ${userId}\nSo'rov: ${message}${historyText}`,
      systemPrompt
    );

    return res.json({ reply, tokensUsed });
  } catch (error) {
    console.error("[chatWithAi] Error:", error);
    return res
      .status(500)
      .json({ message: "AI bilan suhbatda xato yuz berdi." });
  }
}

export async function generateRoadmap(req, res) {
  try {
    const { userId, targetGrant } = req.body || {};
    if (!userId || !targetGrant?.title || !targetGrant?.deadline) {
      return res.status(400).json({
        message: "userId va targetGrant (title, deadline) majburiy.",
      });
    }

    const userDoc = await db.collection("users").doc(userId).get();
    const prefs = userDoc.exists ? userDoc.data()?.preferences || {} : {};

    const gpa = prefs.gpa ?? null;
    const ielts = prefs.ielts ?? null;
    const degree = prefs.degree ?? null;
    const field = prefs.field ?? null;

    const months = monthDiff(Date.now(), targetGrant.deadline);

    const prompt =
      `Sen ta'lim maslahatchisi. Quyidagi talaba ma'lumotlari asosida ${targetGrant.title} granti uchun ${targetGrant.deadline} muddatgacha ${months} oylik tayyorgarlik rejasini JSON formatda yarat.\n\n` +
      `Talaba: GPA: ${gpa}, IELTS: ${ielts}, Daraja: ${degree}, Soha: ${field}\n\n` +
      `Format:\n` +
      `{\n` +
      `  "steps": [\n` +
      `    { "month": "1-2", "icon": "book", "title": "", "description": "", "status": "in_progress" },\n` +
      `    { "month": "3", "icon": "calendar", "title": "", "description": "", "status": "upcoming" }\n` +
      `  ],\n` +
      `  "totalMonths": ${months},\n` +
      `  "summary": ""\n` +
      `}\n\n` +
      `Faqat JSON qaytargin, boshqa matn yo'q.`;

    const { reply } = await askGemini(prompt, "");
    const jsonText = extractJson(reply);
    if (!jsonText) {
      return res.status(500).json({ message: "AI JSON qaytarmadi." });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      console.error("[generateRoadmap] JSON parse error:", e);
      return res.status(500).json({ message: "AI JSON parse qilib bo'lmadi." });
    }

    return res.json(parsed);
  } catch (error) {
    console.error("[generateRoadmap] Error:", error);
    return res
      .status(500)
      .json({ message: "Roadmap yaratishda xato yuz berdi." });
  }
}

