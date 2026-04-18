import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { db } from "../lib/firebase.js";
import { collection, doc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { Calendar as CalendarIcon, CheckCircle2, Clock, MapPin, Trash2 } from "lucide-react";

const CATEGORY_COLORS = {
    exam: "border-l-4 border-l-blue-500 bg-blue-500/5",
    document: "border-l-4 border-l-emerald-500 bg-emerald-500/5",
    writing: "border-l-4 border-l-orange-500 bg-orange-500/5",
    submission: "border-l-4 border-l-rose-500 bg-rose-500/5",
};

export default function GrantCalendar() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!user?.uid) return;
            setLoading(true);
            try {
                const snap = await getDocs(collection(db, "userCalendars", user.uid, "plans"));
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                setPlans(list);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [user?.uid]);

    const toggleStep = async (planId, stepId, currentStatus) => {
        if (!user?.uid) return;
        try {
            const plan = plans.find((p) => p.id === planId);
            const updatedSteps = plan.steps.map((s) =>
                s.id === stepId ? { ...s, completed: !currentStatus } : s
            );

            await updateDoc(doc(db, "userCalendars", user.uid, "plans", planId), {
                steps: updatedSteps,
            });

            setPlans((prev) =>
                prev.map((p) => (p.id === planId ? { ...p, steps: updatedSteps } : p))
            );
        } catch (e) {
            console.error(e);
        }
    };

    const deletePlan = async (planId) => {
        if (!user?.uid) return;
        if (!window.confirm("Bu rejani haqiqatan ham o'chirishni istaysizmi?")) return;
        try {
            await deleteDoc(doc(db, "userCalendars", user.uid, "plans", planId));
            setPlans((prev) => prev.filter((p) => p.id !== planId));
        } catch (e) {
            console.error("Rejani o'chirishda xatolik:", e);
        }
    };

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="h-10 w-10 rounded-full border-4 border-slate-700 border-t-[#3D3DC4] animate-spin" />
                <p className="text-slate-400">Rejalarni yuklamoqda...</p>
            </div>
        );
    }

    return (
        <div className="py-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-50">My Application Plans</h1>
                <div className="h-10 w-10 rounded-full bg-[#1E293B] flex items-center justify-center text-[#3D3DC4] border border-[#334155]">
                    <CalendarIcon size={20} />
                </div>
            </div>

            {!plans.length ? (
                <Card className="bg-[#1E293B] border-[#334155] rounded-2xl p-10 text-center">
                    <div className="h-16 w-16 bg-[#0F172A] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#334155] text-slate-400">
                        <CalendarIcon size={32} />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-50">Hali hech qanday reja yo'q</h2>
                    <p className="text-slate-400 mt-2 max-w-sm mx-auto">
                        Grantlarni ko'rib chiqing va o'zingizning shaxsiy tayyorgarlik rejangizni yarating.
                    </p>
                    <Button
                        className="mt-6"
                        onClick={() => navigate("/search")}
                    >
                        Browse Grants
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const completed = plan.steps?.filter((s) => s.completed)?.length || 0;
                        const total = plan.steps?.length || 0;
                        const progress = total > 0 ? (completed / total) * 100 : 0;

                        // Find next deadline
                        const nextStep = plan.steps?.find(s => !s.completed);

                        return (
                            <div key={plan.id} className="space-y-3">
                                <Card className="bg-[#1E293B] border-[#334155] rounded-2xl p-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-50">{plan.grantTitle}</h3>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                                                <MapPin size={14} /> {plan.country || "Xalqaro"}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <button 
                                              onClick={() => deletePlan(plan.id)}
                                              className="text-slate-500 hover:text-rose-500 transition-colors p-1"
                                              title="Rejani o'chirish"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-[#3D3DC4]">{Math.round(progress)}%</div>
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Progress</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 h-1.5 w-full bg-[#0F172A] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#3D3DC4] transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    {nextStep && (
                                        <div className="mt-4 flex items-center gap-2 text-sm">
                                            <Clock size={14} className="text-orange-400" />
                                            <span className="text-slate-200">
                                                Next: <span className="font-semibold text-slate-50">{nextStep.title}</span> — {nextStep.endDate}
                                            </span>
                                        </div>
                                    )}

                                    <div className="mt-6 space-y-3">
                                        {plan.steps?.map((step) => (
                                            <div
                                                key={step.id}
                                                className={[
                                                    "p-3 rounded-xl border border-[#334155]/50 flex items-start gap-3 transition-opacity",
                                                    CATEGORY_COLORS[step.category] || "bg-[#0F172A]",
                                                    step.completed ? "opacity-50 grayscale" : ""
                                                ].join(" ")}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => toggleStep(plan.id, step.id, step.completed)}
                                                    className={[
                                                        "mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                                                        step.completed
                                                            ? "bg-[#3D3DC4] border-[#3D3DC4] text-white"
                                                            : "border-[#334155] hover:border-[#3D3DC4]"
                                                    ].join(" ")}
                                                >
                                                    {step.completed && <CheckCircle2 size={14} />}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <div className={[
                                                        "text-sm font-bold text-slate-50",
                                                        step.completed ? "line-through" : ""
                                                    ].join(" ")}>
                                                        {step.title}
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                                                        {step.description}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-black/20 text-slate-300">
                                                            {step.category}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-medium">
                                                            {step.startDate} - {step.endDate}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
