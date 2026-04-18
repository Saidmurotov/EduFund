import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { db } from "../lib/firebase.js";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  GraduationCap, BookOpen, BarChart2, Globe, Goal,
  Settings, LogOut, Edit3, ShieldCheck, ChevronRight,
  CheckCircle2, Flame, Bookmark, Calendar, X
} from "lucide-react";
import { initials } from "../lib/utils.js";
import { DEGREE_CHOICES } from "../lib/constants.js";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [pref, setPref] = useState(null);
  const [stats, setStats] = useState({ saved: 0, viewed: 0, plans: 0 });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    async function load() {
      if (!user?.uid) return;
      try {
        const uDoc = await getDoc(doc(db, "userProfiles", user.uid));
        const p = uDoc.data()?.preferences || {};
        setPref(p);
        setEditForm(p);

        // Stats
        const savedSnap = await getDocs(collection(db, "savedGrants", user.uid, "items"));
        const plansSnap = await getDocs(collection(db, "userCalendars", user.uid, "plans"));

        setStats({
          saved: savedSnap.size,
          plans: plansSnap.size,
          viewed: uDoc.data()?.viewedCount || 0
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.uid]);

  const handleSave = async () => {
    if (!user?.uid) return;
    try {
      await updateDoc(doc(db, "userProfiles", user.uid), {
        preferences: editForm
      });
      setPref(editForm);
      setIsEditOpen(false);
      toast?.showToast?.("Profil muvaffaqiyatli saqlandi!", "success");
    } catch (e) {
      console.error(e);
      toast?.showToast?.("Saqlashda xato yuz berdi.", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-slate-700 border-t-[#3D3DC4] animate-spin" />
        <p className="text-slate-400">Profilingiz yuklanmoqda...</p>
      </div>
    );
  }

  const isPremium = user?.isPremium || false;

  return (
    <div className="py-6 space-y-6 pb-20 lg:pb-6">
      {/* Header Profile — full width */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#3D3DC4] to-[#1E1E7A] p-6 shadow-xl shadow-[#3D3DC4]/20">
        <div className="relative z-10 flex items-center gap-5">
          <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
            {initials(pref?.name || user?.email)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white truncate">{pref?.name || "Talaba"}</h1>
              {isPremium && <div className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><ShieldCheck size={10} /> Premium</div>}
            </div>
            <p className="text-white/60 text-sm truncate">{user?.email}</p>
            <button
              onClick={() => setIsEditOpen(true)}
              className="mt-2 text-xs font-bold text-white/80 hover:text-white uppercase tracking-widest flex items-center gap-1.5"
            >
              <Edit3 size={12} /> Profilni tahrirlash
            </button>
          </div>
        </div>
        {/* Abstract background shapes */}
        <div className="absolute -right-4 -top-4 h-32 w-32 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute right-12 bottom-0 h-20 w-20 bg-white/10 rounded-full blur-xl" />
      </div>

      {/* Desktop: 2/3 + 1/3 layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Academic Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#1E293B] border-[#334155] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                <GraduationCap size={20} className="text-[#3D3DC4]" /> Akademik Ma'lumotlar
              </h2>
              <Edit3 size={16} className="text-slate-600 cursor-pointer" onClick={() => setIsEditOpen(true)} />
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <ProfileField label="Daraja" value={pref?.degree ? DEGREE_CHOICES.find(d => d.value === pref.degree)?.label : "—"} Icon={BookOpen} color="text-blue-400" />
              <ProfileField label="GPA" value={pref?.gpa ? `${pref.gpa} (${pref.gpaSystem})` : "—"} Icon={BarChart2} color="text-teal-400" />
              <ProfileField label="IELTS / TOEFL" value={pref?.ielts ? `${pref.ielts} (IELTS)` : pref?.toefl ? `${pref.toefl} (TOEFL)` : "—"} Icon={Globe} color="text-indigo-400" />
              <ProfileField label="SAT / GRE / GMAT" value={pref?.sat ? `${pref.sat} (SAT)` : pref?.gre ? `${pref.gre} (GRE)` : pref?.gmat ? `${pref.gmat} (GMAT)` : "—"} Icon={Goal} color="text-rose-400" />
              <ProfileField label="Sohalar" value={pref?.fields?.length ? pref.fields.join(', ') : "—"} Icon={BookOpen} color="text-orange-400" />
              <ProfileField label="Viloyat" value={pref?.region || "—"} Icon={MapPin} color="text-cyan-400" />
            </div>

            <div className="mt-8 pt-6 border-t border-[#334155]/50">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest">Maqsad davlatlar</div>
              <div className="flex flex-wrap gap-2">
                {(pref?.targetCountries || pref?.countries)?.length ? (pref?.targetCountries || pref?.countries).map(c => (
                  <span key={c} className="px-3 py-1 rounded-full bg-[#0F172A] border border-[#334155] text-xs text-slate-300 font-medium">
                    {c}
                  </span>
                )) : <span className="text-xs text-slate-500 italic">Hali tanlanmagan</span>}
              </div>
            </div>
          </Card>

          {/* Goals — inside left column on desktop */}
          <Card className="bg-[#1E293B] border-[#334155] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Goal size={16} className="text-[#3D3DC4]" /> Maqsadlar
            </h3>
            <div className="flex flex-wrap gap-2">
              {pref?.goals?.length ? pref.goals.map(g => (
                <div key={g} className="px-3 py-2 rounded-xl bg-[#3D3DC4]/10 text-[#3D3DC4] text-xs font-bold capitalize">
                  {g.replace('_', ' ')}
                </div>
              )) : <span className="text-xs text-slate-500 italic">Hali ko'rsatilmagan</span>}
            </div>
          </Card>
        </div>

        {/* Right — Stats + Premium + Settings */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats */}
          <Card className="bg-[#1E293B] border-[#334155] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-emerald-500" /> Statistika
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatItem label="Saqlangan" value={stats.saved} Icon={Bookmark} color="text-emerald-400" />
              <StatItem label="Rejalar" value={stats.plans} Icon={Calendar} color="text-blue-400" />
            </div>
          </Card>

          {/* Premium Promo */}
          {!isPremium && (
            <Card className="bg-gradient-to-r from-[#3D3DC4] to-[#6366F1] border-none rounded-[24px] p-6 text-white overflow-hidden relative group cursor-pointer" onClick={() => navigate('/premium')}>
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Flame size={20} className="text-amber-300 fill-amber-300" /> Premium'ga o'ting
                  </h2>
                  <ChevronRight size={20} className="text-white/40 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </div>
                <ul className="text-white/90 text-sm space-y-2.5 font-medium">
                  <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-amber-300 shrink-0 mt-px" /> Cheksiz AI chat (kuniga 5 o'rniga)</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-amber-300 shrink-0 mt-px" /> To'liq Roadmap (12-18 oylik)</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-amber-300 shrink-0 mt-px" /> Barcha grantlar filtri</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-amber-300 shrink-0 mt-px" /> Deadline push eslatmalari</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-amber-300 shrink-0 mt-px" /> AI priority matching</li>
                </ul>
              </div>
              <div className="absolute top-0 right-0 h-full w-1/3 bg-white/10 skew-x-[-20deg] blur-lg" />
            </Card>
          )}

          {/* Settings & Logout */}
          <div className="space-y-3">
            <button className="w-full p-4 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-between group transition-colors hover:border-[#3D3DC4]/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-slate-500 group-hover:text-[#3D3DC4]">
                  <Settings size={18} />
                </div>
                <span className="text-sm font-bold text-slate-300">Sozlamalar</span>
              </div>
              <ChevronRight size={16} className="text-slate-600" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-center gap-2 group transition-all hover:bg-rose-500/10"
            >
              <LogOut size={18} className="text-rose-500" />
              <span className="text-sm font-bold text-rose-500">Hisobdan chiqish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="bg-[#1E293B] border-[#334155] rounded-2xl w-full max-w-lg p-6 flex flex-col gap-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-50">Profilni tahrirlash</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Ism</label>
                <input
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-[#3D3DC4]"
                  value={editForm.name}
                  onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">GPA ({editForm.gpaSystem})</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-[#3D3DC4]"
                    value={editForm.gpa}
                    onChange={(e) => setEditForm(p => ({ ...p, gpa: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">IELTS</label>
                  <input
                    type="number"
                    step="0.5"
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-[#3D3DC4]"
                    value={editForm.ielts}
                    onChange={(e) => setEditForm(p => ({ ...p, ielts: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">TOEFL</label>
                  <input
                    type="number"
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-[#3D3DC4]"
                    value={editForm.toefl}
                    onChange={(e) => setEditForm(p => ({ ...p, toefl: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">SAT</label>
                  <input
                    type="number"
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-[#3D3DC4]"
                    value={editForm.sat}
                    onChange={(e) => setEditForm(p => ({ ...p, sat: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Daraja</label>
                <select
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-[#3D3DC4] appearance-none"
                  value={editForm.degree}
                  onChange={(e) => setEditForm(p => ({ ...p, degree: e.target.value }))}
                >
                  {DEGREE_CHOICES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsEditOpen(false)}>Bekor qilish</Button>
              <Button className="flex-1" onClick={handleSave}>Saqlash</Button>
            </div>
          </Card>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function ProfileField({ label, value, Icon, color }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 ${color}`}>
        <Icon size={16} />
      </div>
      <div>
        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{label}</div>
        <div className="text-sm font-bold text-slate-300">{value}</div>
      </div>
    </div>
  );
}

function StatItem({ label, value, Icon, color }) {
  return (
    <div className="bg-[#0F172A] border border-[#334155]/50 rounded-xl p-3 flex items-center gap-3">
      <div className={`${color} shrink-0`}>
        <Icon size={16} />
      </div>
      <div>
        <div className="text-[9px] text-slate-500 uppercase font-bold">{label}</div>
        <div className="text-sm font-extrabold text-slate-200">{value}</div>
      </div>
    </div>
  );
}
