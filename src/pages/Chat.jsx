import { useEffect, useMemo, useRef, useState } from "react";
import { Info, SendHorizonal } from "lucide-react";
import MessageBubble from "../components/chat/MessageBubble.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { askGemini } from "../lib/gemini.js";
import { useToast } from "../context/ToastContext.jsx";

const LIMIT = 5;
const STORAGE_KEY = "edufund_ai_chat_limit";

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getLimitState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: todayKey(), count: 0 };
    const parsed = JSON.parse(raw);
    if (parsed.date !== todayKey()) return { date: todayKey(), count: 0 };
    return { date: parsed.date, count: Number(parsed.count || 0) };
  } catch {
    return { date: todayKey(), count: 0 };
  }
}

function setLimitState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function Chat() {
  const { user } = useAuth();
  const toast = useToast();

  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      content:
        "Salom! Men EduFund AI Advisor. Grant qidirish, hujjatlar tayyorlash yoki xorijda o'qish haqida savol bering. Sizga yordam berishga tayyorman! 🎓",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(() => getLimitState());

  const scrollerRef = useRef(null);

  const usedToday = limit.count;
  const limitReached = usedToday >= LIMIT;

  const conversationHistory = useMemo(() => {
    return messages.map((m) => ({ role: m.role, content: m.content }));
  }, [messages]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, sending]);

  useEffect(() => {
    const state = getLimitState();
    setLimit(state);
  }, []);

  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    if (limitReached) {
      toastRef.current?.showToast?.("Kunlik limit tugadi. Premium'ga o'ting", "warning");
    }
  }, [limitReached]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    if (!user?.uid) {
      setError("Avval login qiling.");
      return;
    }
    if (limitReached) {
      toast?.showToast?.("Kunlik limit tugadi. Premium'ga o'ting", "warning");
      return;
    }

    setError("");
    setInput("");
    setSending(true);

    const userMsg = { role: "user", content: text, timestamp: Date.now() };
    setMessages((p) => [...p, userMsg]);

    const typingId = crypto.randomUUID();
    setMessages((p) => [
      ...p,
      { id: typingId, role: "assistant", content: "...", timestamp: Date.now() },
    ]);

    try {
      const replyText = await askGemini(text, conversationHistory);

      setMessages((p) =>
        p.map((m) =>
          m.id === typingId ? { ...m, content: replyText, timestamp: Date.now() } : m
        )
      );

      const next = { date: todayKey(), count: usedToday + 1 };
      setLimit(next);
      setLimitState(next);
    } catch (e) {
      console.error(e);
      setMessages((p) => p.filter((m) => m.id !== typingId));
      setError("AI bilan bog'lanishda xato yuz berdi.");
      toast?.showToast?.("Internet bilan muammo", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="py-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-slate-50">AI Advisor</div>
          <div className="text-sm text-[#64748B] mt-1">Powered by Gemini</div>
        </div>
        <button
          type="button"
          className="h-10 w-10 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center text-slate-200 hover:border-slate-400 transition-colors"
          aria-label="Info"
        >
          <Info size={18} />
        </button>
      </div>

      {limitReached && (
        <div className="mt-4 bg-[#1E293B] border border-[#F59E0B]/40 rounded-xl px-4 py-3 text-sm text-slate-100">
          <span className="text-[#F59E0B] font-semibold">
            Bugungi limitingiz tugadi.
          </span>{" "}
          Premium'ga o'ting.
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        {!limitReached && (
          <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
            FREE: {usedToday}/{LIMIT} USED TODAY
          </div>
        )}
        {error && <div className="text-sm text-[#EF4444]">{error}</div>}
      </div>

      <div
        ref={scrollerRef}
        className="mt-4 h-[calc(100vh-18rem)] lg:h-[calc(100vh-14rem)] overflow-y-auto pr-1 space-y-3"
      >
        {messages.map((m, idx) => (
          <MessageBubble key={m.id || idx} message={m} isUser={m.role === "user"} />
        ))}
      </div>

      <div className="mt-4 sticky bottom-16 lg:bottom-4">
        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!sending && !limitReached) send();
              }
            }}
            placeholder="Savolingizni yozing..."
            className="flex-1 bg-transparent outline-none text-slate-100 placeholder:text-[#64748B]"
            disabled={sending || limitReached}
          />
          <button
            type="button"
            onClick={() => send()}
            disabled={sending || limitReached || !input.trim()}
            className="h-10 w-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center disabled:opacity-50"
            aria-label="Send"
          >
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

