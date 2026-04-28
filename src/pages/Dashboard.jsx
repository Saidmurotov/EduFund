import { useEffect, useState } from "react";
import GreetingHeader from "../components/dashboard/GreetingHeader.jsx";
import StatCards from "../components/dashboard/StatCards.jsx";
import GrantList from "../components/dashboard/GrantList.jsx";
import UpcomingTasks from "../components/dashboard/UpcomingTasks.jsx";
import { SkeletonDashboard } from "../components/ui/Skeleton.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { api, withAuth } from "../lib/api.js";

export default function Dashboard() {
  const { user, getIdToken } = useAuth();
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!user?.uid) return;
      setLoading(true);
      setError("");
      try {
        const headers = await withAuth(getIdToken);
        const res = await api.get(`/grants/match/${user.uid}`, {
          params: { limit: 20 },
          headers,
        });

        if (!alive) return;
        setGrants(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Grantlarni yuklashda xato:", e);
        if (!alive) return;
        setError("Grantlarni yuklashda xato yuz berdi. Iltimos qaytadan urinib ko'ring yoki .env sozlamalarini tekshiring.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [user?.uid, getIdToken]);

  if (loading) return <SkeletonDashboard />;

  return (
    <div className="space-y-[1.5rem]">
      {/* Greeting — full width */}
      <GreetingHeader name={user?.name || user?.email} count={grants.length} />

      {/* Stats — wide grid on desktop */}
      <StatCards />

      {/* Error */}
      {error ? (
        <div className="text-sm text-[#EF4444] bg-[#1E293B] border border-[#EF4444]/40 rounded-lg px-[1rem] py-[0.5rem]">
          {error}
        </div>
      ) : (
        /* Desktop: 3-column, Grant list takes 2 cols */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1.5rem]">
          <div className="lg:col-span-2">
            {grants.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-[3rem] bg-[#1E293B] border border-[#334155] rounded-2xl text-center">
                <span className="text-4xl mb-[1rem]">📭</span>
                <h3 className="text-lg font-bold text-slate-100 mb-[0.5rem]">Hozircha grantlar mavjud emas</h3>
                <p className="text-sm text-slate-400">Tez orada yangi grantlar qo'shiladi yoki filtringizga mos grant hozircha yo'q.</p>
              </div>
            ) : (
              <GrantList grants={grants} />
            )}
          </div>
          <div className="lg:col-span-1 space-y-[1rem]">
            {/* Quick stats sidebar widget */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-[1.25rem]">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-[1rem]">
                Tez ma'lumot
              </h3>
              <div className="space-y-[0.75rem]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Jami grantlar</span>
                  <span className="text-sm font-bold text-slate-50">{grants.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Maqsad davlat grantlari</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {grants.filter((g) => g.isPriority).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">O'rtacha match</span>
                  <span className="text-sm font-bold text-[#3D3DC4]">
                    {grants.length > 0
                      ? Math.round(
                        grants.reduce((a, g) => a + (g.matchPercent || 0), 0) /
                        grants.length
                      )
                      : "0"}
                    %
                  </span>
                </div>
              </div>
            </div>
            
            <UpcomingTasks />

            <div className="bg-gradient-to-br from-[#3D3DC4]/10 to-[#6366F1]/10 border border-[#3D3DC4]/20 rounded-2xl p-[1.25rem]">
              <h3 className="text-sm font-bold text-[#3D3DC4] mb-[0.5rem] flex items-center gap-[0.5rem]">
                💡 Maslahat
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Profilingizni to'ldiring — GPA, IELTS va maqsad davlatlarni
                ko'rsating. Shunda grantlar mosligi aniqroq bo'ladi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
