import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const askGemini = async (message, history = []) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const systemPrompt = `Sen EduFund AI — O'zbekiston talabalari uchun grant va stipendiya maslahatchisin.
Faqat grantlar, stipendiyalar, xorijda o'qish, hujjatlar tayyorlash haqida javob ber.
O'zbek, Rus va Ingliz tillarida javob bera olasan.
Javoblarni qisqa va aniq yoz.`;

  const chat = model.startChat({
    history: history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })),
    systemInstruction: systemPrompt
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
};
