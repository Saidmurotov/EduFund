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

    const userDoc = await db.collection("userProfiles").doc(userId).get();
    const prefs = userDoc.exists ? userDoc.data()?.preferences || {} : {};

    const gpa = prefs.gpa ?? null;
    const ielts = prefs.ielts ?? null;
    const degree = prefs.degree ?? null;
    const field = prefs.field ?? null;

    const todayStr = new Date().toISOString().split("T")[0];

    const prompt =
      `Sen ta'lim va grantlar bo'yicha maslahatchisan. Quyidagi talaba ma'lumotlari asosida "${targetGrant.title}" granti uchun ${todayStr} dan boshlab ${targetGrant.deadline} muddatgacha tayyorgarlik rejasini (Roadmap) JSON formatda yarat.\n\n` +
      `Talaba: GPA: ${gpa}, IELTS: ${ielts}, Daraja: ${degree}, Soha: ${field}\n\n` +
      `Har bir qadam mantiqiy, ketma-ket va aniq sanalarga ega bo'lsin. Category turlari: 'exam' | 'document' | 'writing' | 'submission'.\n\n` +
      `FORMAT:\n` +
      `{\n` +
      `  "steps": [\n` +
      `    { "id": 1, "title": "Til imtihoni topshirish", "description": "IELTS/TOEFL ga tayyorgarlik...", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "category": "exam", "completed": false }\n` +
      `  ]\n` +
      `}\n\n` +
      `Faqat JSON qaytargin, boshqa matn umuman bo'lmasin.`;

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

    const planData = {
      userId: userId, // Query filtr uchun qo'shildi
      grantTitle: targetGrant.title,
      country: targetGrant.country || "Xalqaro",
      deadline: targetGrant.deadline,
      createdAt: new Date(),
      steps: parsed.steps || [],
    };

    const docRef = await db
      .collection("userCalendars")
      .doc(userId)
      .collection("plans")
      .add(planData);

    return res.json({ id: docRef.id, ...planData });
  } catch (error) {
    console.error("[generateRoadmap] Error:", error);
    return res
      .status(500)
      .json({ message: "Roadmap yaratishda xato yuz berdi." });
  }
}

