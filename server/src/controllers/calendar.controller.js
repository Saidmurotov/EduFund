import { askGemini } from "../lib/gemini.js";

function extractJson(text) {
    const s = String(text || "");
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    return s.slice(start, end + 1);
}

export async function generateCalendarPlan(req, res) {
    try {
        const { userId, grantTitle, startDate, deadline, requirements } = req.body || {};

        if (!grantTitle || !deadline) {
            return res.status(400).json({ message: "grantTitle va deadline majburiy." });
        }

        const systemPrompt = "Sen professional ta'lim va grantlar bo'yicha maslahatchisan.";

        const prompt = `
Talaba ${startDate || 'bugun'} dan boshlab ${deadline} gacha "${grantTitle}" granti uchun ariza tayyorlamoqchi.
Grant talablari: ${requirements || 'Standard grant hujjatlari'}.

Ushbu muddat ichida taxminiy tayyorgarlik bosqichlarini (milestones) JSON formatda chiqar.
Bosqichlar mantiqiy, ketma-ket va realistik bo'lsin.

FORMAT:
{
  "steps": [
    {
      "id": 1,
      "title": "IELTS/TOEFL ga tayyorgarlik",
      "description": "Til darajasini oshirish va testga ro'yxatdan o'tish",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "category": "exam",
      "priority": "high"
    },
    {
      "id": 2,
      "title": "Motivation Letter yozish",
      "description": "Grant uchun insho tayyorlash",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "category": "writing",
      "priority": "medium"
    }
  ]
}

Category turlari: 'exam' | 'document' | 'writing' | 'submission'.
Priority turlari: 'high' | 'medium' | 'low'.
Faqat JSON qaytargin, boshqa matn bo'lmasin.
`;

        const { reply } = await askGemini(prompt, systemPrompt);
        const jsonText = extractJson(reply);

        if (!jsonText) {
            return res.status(500).json({ message: "AI rejani generatsiya qila olmadi (JSON topilmadi)." });
        }

        let parsed;
        try {
            parsed = JSON.parse(jsonText);
        } catch (e) {
            console.error("[generateCalendarPlan] JSON parse error:", e);
            return res.status(500).json({ message: "AI qaytargan format noto'g'ri." });
        }

        return res.json(parsed);
    } catch (error) {
        console.error("[generateCalendarPlan] Error:", error);
        return res.status(500).json({ message: "Plan yaratishda xato yuz berdi." });
    }
}
