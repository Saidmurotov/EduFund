import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { db } from "../lib/firebase.js";
import { collection, onSnapshot, query, orderBy, getDocs } from "firebase/firestore";
import Card from "../components/ui/Card.jsx";
import GrantCard from "../components/dashboard/GrantCard.jsx";
import { Bookmark, Send, Calendar, ChevronRight, LayoutGrid, List } from "lucide-react";

export default function Saved() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("saved");
  const [savedGrants, setSavedGrants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    // Real-time saved grants
    const q = query(
      collection(db, "savedGrants", user.uid, "items"),
      orderBy("savedAt", "desc")
    );
    const unsubSaved = onSnapshot(q, (snap) => {
      setSavedGrants(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    // Fetch plans once
    async function fetchPlans() {
      const snap = await getDocs(collection(db, "userCalendars", user.uid, "plans"));
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    fetchPlans();

    return () => unsubSaved();
  }, [user?.uid]);

  const tabs = [
    { id: "saved", label: "Saqlangan", Icon: Bookmark },
    { id: "apps", label: "Arizalar", Icon: Send },
    { id: "plans", label: "Rejalar", Icon: Calendar },
  ];

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-slate-700 border-t-[#3D3DC4] animate-spin" />
        <p className="text-slate-400">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-50">Sizning ro'yxatingiz</h1>
        <div className="flex gap-1 p-0.5 bg-[#1E293B] border border-[#334155] rounded-xl">
          <button className="h-8 w-8 rounded-lg bg-[#3D3DC4] flex items-center justify-center text-white"><LayoutGrid size={16} /></button>
          <button className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300"><List size={16} /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#1E293B] border border-[#334155] rounded-2xl p-1.5 sticky top-2 z-20">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={[
              "flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2",
              activeTab === id
                ? "bg-[#3D3DC4] text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            ].join(" ")}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <div className="pt-2 pb-20">
        {activeTab === "saved" && (
          <div className="space-y-4">
            {!savedGrants.length ? (
              <EmptyState icon={Bookmark} text="Hali hech narsa yo'q" subtext="Qidiruv orqali mos grantlarni toping." onAction={() => navigate('/search')} btnText="Grant qidirish" />
            ) : (
              savedGrants.map(g => (
                <GrantCard key={g.id} grant={g} matchPercent={g.matchPercent} />
              ))
            )}
          </div>
        )}

        {activeTab === "apps" && (
          <div className="space-y-4">
            <EmptyState icon={Send} text="Arizalar mavjud emas" subtext="Hozirda hech qanday grantga ariza topshirmagansiz." onAction={() => navigate('/search')} btnText="Arizani boshlash" />
          </div>
        )}

        {activeTab === "plans" && (
          <div className="space-y-4">
            {!plans.length ? (
              <EmptyState icon={Calendar} text="Hali rejalar yo'q" subtext="Saqlangan grantlaringiz uchun tayyorgarlik rejasini yarating." onAction={() => navigate('/calendar')} btnText="Rejalarga o'tish" />
            ) : (
              plans.map(plan => {
                const completed = plan.steps?.filter(s => s.completed)?.length || 0;
                const total = plan.steps?.length || 1;
                const progress = Math.round((completed / total) * 100);
                return (
                  <Card key={plan.id} className="bg-[#1E293B] border-[#334155] rounded-2xl p-5 hover:border-[#3D3DC4]/50 transition-colors cursor-pointer" onClick={() => navigate('/calendar')}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-50 truncate">{plan.grantTitle}</h3>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">{plan.country} • {total} ta bosqich</p>
                      </div>
                      <ChevronRight size={18} className="text-slate-700" />
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-[#0F172A] rounded-full overflow-hidden">
                        <div className="h-full bg-[#3D3DC4] transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-[#3D3DC4]">{progress}%</span>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text, subtext, onAction, btnText }) {
  return (
    <Card className="bg-[#1E293B] border-[#334155] rounded-2xl py-16 px-8 text-center border-dashed">
      <div className="h-14 w-14 bg-[#0F172A] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#334155] text-slate-500">
        <Icon size={24} />
      </div>
      <h2 className="text-xl font-bold text-slate-50">{text}</h2>
      <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">{subtext}</p>
      <Button onClick={onAction} className="mt-8 px-10">
        {btnText}
      </Button>
    </Card>
  );
}
