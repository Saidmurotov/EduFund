import { useState } from "react";
import { Check, Star, Rocket, ShieldCheck, ChevronDown, ChevronUp, Zap, HelpCircle } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { db } from "../lib/firebase.js";
import { collection, addDoc } from "firebase/firestore";

const FEATURES = [
    "Cheksiz AI maslahat (kuniga 5 o'rniga ∞)",
    "To'liq Academic Roadmap (12-18 oylik)",
    "CV va Motivation Letter AI tekshirish",
    "Barcha grant filtrlari (250+ grant)",
    "Smart Calendar va deadline eslatmalari",
    "Priority support va eksklyuziv webinar"
];

const FAQS = [
    { q: "To'lov qanday amalga oshiriladi?", a: "Hozircha Payme va Click integratsiya qilinmoqda. To'lov tasdiqlangandan so'ng premium darhol faollashadi." },
    { q: "Bekor qilsam pul qaytariladi?", a: "Ha, 7 kun ichida to'liq pulingizni qaytarib olishingiz mumkin." },
    { q: "Qachon premium faollashadi?", a: "To'lov amalga oshirilgandan so'ng 1-5 daqiqa ichida barcha funksiyalar ochiladi." }
];

export default function Premium() {
    const { user } = useAuth();
    const toast = useToast();
    const [selectedPlan, setSelectedPlan] = useState("yearly");
    const [openFaq, setOpenFaq] = useState(null);

    const handleSubscribe = async (planType) => {
        if (!user?.uid) return;
        try {
            // Log intent to Firestore
            await addDoc(collection(db, "paymentIntents"), {
                userId: user.uid,
                email: user.email,
                plan: planType,
                status: "pending",
                createdAt: new Date().toISOString()
            });

            alert("Tez kunda! Payme/Click integratsiya qilinmoqda. Hozircha bu xususiyat sinov rejimida.");
            toast?.showToast?.("Operatorlarimiz siz bilan bog'lanishadi!", "info");
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="py-10 space-y-12 pb-32">
            {/* Header */}
            <div className="text-center space-y-4 max-w-lg mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#3D3DC4]/15 border border-[#3D3DC4]/30 text-[#3D3DC4] text-xs font-bold uppercase tracking-widest">
                    <Star size={14} className="fill-[#3D3DC4]" /> Unlock Full Potential
                </div>
                <h1 className="text-4xl font-extrabold text-slate-50 leading-tight">
                    EduFund AI <span className="bg-gradient-to-r from-[#3D3DC4] to-[#6366F1] bg-clip-text text-transparent">Premium</span>
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed px-4">
                    Grantlar yo'lingizda hech qanday to'siq bo'lmasin.
                    AI imkoniyatlaridan cheksiz foydalaning.
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-0">
                {/* Monthly Plan */}
                <div
                    onClick={() => setSelectedPlan("monthly")}
                    className={[
                        "relative group p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300",
                        selectedPlan === "monthly"
                            ? "bg-[#1E293B] border-[#3D3DC4] shadow-2xl shadow-[#3D3DC4]/10"
                            : "bg-[#0F172A] border-[#334155] hover:border-slate-600"
                    ].join(" ")}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-200">Oylik reja</h3>
                            <div className="text-2xl font-black text-slate-50">29,000 so'm <span className="text-xs text-slate-500 font-bold">/ oy</span></div>
                        </div>
                        <div className={[
                            "h-10 w-10 rounded-2xl flex items-center justify-center transition-all",
                            selectedPlan === "monthly" ? "bg-[#3D3DC4] text-white" : "bg-[#1E293B] text-slate-600"
                        ].join(" ")}>
                            <Rocket size={20} />
                        </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {FEATURES.map(f => (
                            <li key={f} className="flex gap-3 text-xs text-slate-400 leading-snug">
                                <Check size={14} className="text-[#3D3DC4] shrink-0 mt-0.5" /> {f}
                            </li>
                        ))}
                    </ul>

                    <Button
                        onClick={() => handleSubscribe("monthly")}
                        variant={selectedPlan === "monthly" ? "primary" : "outline"}
                        className="w-full py-4 rounded-2xl text-sm font-bold shadow-xl"
                    >
                        Boshlash
                    </Button>
                </div>

                {/* Yearly Plan */}
                <div
                    onClick={() => setSelectedPlan("yearly")}
                    className={[
                        "relative group p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 transform md:scale-105 z-10",
                        selectedPlan === "yearly"
                            ? "bg-[#1E293B] border-[#3D3DC4] shadow-2xl shadow-[#3D3DC4]/20"
                            : "bg-[#0F172A] border-[#334155] hover:border-slate-600"
                    ].join(" ")}
                >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#3D3DC4] text-white text-[10px] font-black uppercase px-6 py-1.5 rounded-full shadow-lg tracking-widest whitespace-nowrap">
                        Best Value — 28% tejaysiz
                    </div>

                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-200">Yillik reja</h3>
                            <div className="text-3xl font-black text-slate-50">249,000 so'm <span className="text-xs text-slate-500 font-bold">/ yil</span></div>
                        </div>
                        <div className={[
                            "h-10 w-10 rounded-2xl flex items-center justify-center transition-all",
                            selectedPlan === "yearly" ? "bg-[#3D3DC4] text-white animate-pulse" : "bg-[#1E293B] text-slate-600"
                        ].join(" ")}>
                            <Star size={20} className="fill-current" />
                        </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {FEATURES.map(f => (
                            <li key={f} className="flex gap-3 text-xs text-slate-300 leading-snug">
                                <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" /> {f}
                            </li>
                        ))}
                        <li className="flex gap-3 text-xs text-[#3D3DC4] font-bold">
                            <Star size={14} className="shrink-0 mt-0.5 fill-[#3D3DC4]" /> Maxsus sertifikat va badge
                        </li>
                    </ul>

                    <Button
                        onClick={() => handleSubscribe("yearly")}
                        className="w-full py-4 rounded-2xl text-sm font-bold bg-[#3D3DC4] hover:bg-[#3232a8] text-white shadow-xl shadow-[#3D3DC4]/30"
                    >
                        Premium'ni faollashtirish
                    </Button>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-4 px-8 border-y border-[#334155]/30">
                <div className="flex flex-col items-center gap-2 text-center text-slate-500">
                    <ShieldCheck size={24} />
                    <div className="text-[10px] uppercase font-bold tracking-widest">Xavfsiz to'lov</div>
                </div>
                <div className="flex flex-col items-center gap-2 text-center text-slate-500">
                    <Zap size={24} />
                    <div className="text-[10px] uppercase font-bold tracking-widest">Tezkor faollashish</div>
                </div>
                <div className="flex flex-col items-center gap-2 text-center text-slate-500 hidden md:flex">
                    <HelpCircle size={24} />
                    <div className="text-[10px] uppercase font-bold tracking-widest">24/7 Qo'llab-quvvatlash</div>
                </div>
            </div>

            {/* FAQ Accordion */}
            <div className="max-w-2xl mx-auto space-y-4 px-4 sm:px-0">
                <h2 className="text-xl font-bold text-slate-50 text-center mb-8">Tez-tez so'raladigan savollar</h2>
                <div className="space-y-3">
                    {FAQS.map((f, i) => (
                        <div
                            key={i}
                            className="p-5 bg-[#1E293B] border border-[#334155] rounded-2xl cursor-pointer hover:border-slate-500 transition-all"
                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-100">{f.q}</span>
                                {openFaq === i ? <ChevronUp size={18} className="text-[#3D3DC4]" /> : <ChevronDown size={18} className="text-slate-500" />}
                            </div>
                            {openFaq === i && (
                                <p className="mt-4 text-sm text-slate-400 leading-relaxed animate-[fadeIn_0.3s_ease-out]">
                                    {f.a}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </div>
    );
}
