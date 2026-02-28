import { useState } from "react";
import { X, Calendar as CalendarIcon, Loader2, Save } from "lucide-react";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";
import { api, withAuth } from "../../lib/api.js";
import { useAuth } from "../../hooks/useAuth.js";
import { db } from "../../lib/firebase.js";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "../../context/ToastContext.jsx";

const CATEGORY_COLORS = {
    exam: "border-l-4 border-l-blue-500 bg-blue-500/5",
    document: "border-l-4 border-l-emerald-500 bg-emerald-500/5",
    writing: "border-l-4 border-l-orange-500 bg-orange-500/5",
    submission: "border-l-4 border-l-rose-500 bg-rose-500/5",
};

export default function CalendarModal({ grant, isOpen, onClose }) {
    const { user, getIdToken } = useAuth();
    const toast = useToast();

    const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(false);
    const [planSteps, setPlanSteps] = useState([]);
    const [saving, setSaving] = useState(false);

    if (!isOpen || !grant) return null;

    const generatePlan = async () => {
        setLoading(true);
        setPlanSteps([]);
        try {
            const headers = await withAuth(getIdToken);
            const res = await api.post(
                "/calendar/generate",
                {
                    userId: user?.uid,
                    grantTitle: grant.title,
                    startDate,
                    deadline: grant.deadline,
                    requirements: grant.description,
                },
                { headers }
            );
            setPlanSteps(res.data?.steps || []);
        } catch (e) {
            console.error(e);
            toast?.showToast?.("AI plan yaratishda xato yuz berdi.", "error");
        } finally {
            setLoading(false);
        }
    };

    const savePlan = async () => {
        if (!user?.uid || !planSteps.length) return;
        setSaving(true);
        try {
            const planId = `${grant.id || grant.opportunityId}`;
            const planRef = doc(db, "userCalendars", user.uid, "plans", planId);

            await setDoc(planRef, {
                grantId: planId,
                grantTitle: grant.title,
                country: grant.country,
                startDate,
                deadline: grant.deadline,
                steps: planSteps.map(s => ({ ...s, completed: false })),
                createdAt: new Date().toISOString(),
            });

            toast?.showToast?.("Reja muvaffaqiyatli saqlandi!", "success");
            onClose();
        } catch (e) {
            console.error(e);
            toast?.showToast?.("Rejani saqlashda xato yuz berdi.", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="bg-[#1E293B] border-[#334155] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col p-0">
                <div className="p-6 border-b border-[#334155] flex items-center justify-between sticky top-0 bg-[#1E293B] z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#3D3DC4] flex items-center justify-center text-white">
                            <CalendarIcon size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-50">Plan Your Application</h2>
                            <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">{grant.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Start Date</label>
                            <input
                                type="date"
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-[#3D3DC4]"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Deadline</label>
                            <div className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-slate-400">
                                {grant.deadline}
                            </div>
                        </div>
                    </div>

                    {!planSteps.length ? (
                        <div className="py-10 text-center">
                            <Button
                                onClick={generatePlan}
                                disabled={loading}
                                className="gap-2 px-8"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : "Generate My Plan"}
                            </Button>
                            <p className="text-xs text-slate-500 mt-4 max-w-xs mx-auto">
                                Sun'iy intellekt sizning muddatingiz va grant talablaridan kelib chiqib bosqichma-bosqich reja tuzadi.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-300">AI Generated Milestones:</h3>
                            <div className="space-y-3">
                                {planSteps.map((step) => (
                                    <div
                                        key={step.id}
                                        className={[
                                            "p-3 rounded-xl border border-[#334155]/50 flex items-start gap-3",
                                            CATEGORY_COLORS[step.category] || "bg-[#0F172A]"
                                        ].join(" ")}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-slate-50">{step.title}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{step.description}</div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-black/20 text-slate-300">
                                                    {step.category}
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                                                    {step.startDate} - {step.endDate}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {planSteps.length > 0 && (
                    <div className="p-6 border-t border-[#334155] flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setPlanSteps([])}
                            className="flex-1"
                        >
                            Regenerate
                        </Button>
                        <Button
                            onClick={savePlan}
                            disabled={saving}
                            className="flex-1 gap-2"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Plan</>}
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
