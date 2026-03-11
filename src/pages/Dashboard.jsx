import { useEffect, useState } from "react";
import GreetingHeader from "../components/dashboard/GreetingHeader.jsx";
import StatCards from "../components/dashboard/StatCards.jsx";
import GrantList from "../components/dashboard/GrantList.jsx";
import { SkeletonDashboard } from "../components/ui/Skeleton.jsx";
import { api, withAuth } from "../lib/api.js";
import { useAuth } from "../hooks/useAuth.js";

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
        const res = await api.get(`/grants/match/${user.uid}`, { headers });
        if (!alive) return;
        setGrants(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError("Grantlarni yuklashda xato yuz berdi.");
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
    <div className="space-y-6">
      {/* Greeting — full width */}
      <GreetingHeader name={user?.name || user?.email} count={grants.length} />

      {/* Stats — wide grid on desktop */}
      <StatCards />

      {/* Error */}
      {error ? (
        <div className="text-sm text-[#EF4444] bg-[#1E293B] border border-[#EF4444]/40 rounded-lg px-3 py-2">
          {error}
        </div>
      ) : (
        /* Desktop: 3-column, Grant list takes 2 cols */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <GrantList grants={grants} />
          </div>
          <div className="xl:col-span-1 space-y-4">
            {/* Quick stats sidebar widget */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                Tez ma'lumot
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Jami grantlar</span>
                  <span className="text-sm font-bold text-slate-50">{grants.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Priority grantlar</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {grants.filter((g) => g.isPriority).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">O'rtacha match</span>
                  <span className="text-sm font-bold text-[#3D3DC4]">
                    {grants.length
                      ? Math.round(
                        grants.reduce((a, g) => a + (g.matchPercent || 0), 0) /
                        grants.length
                      )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#3D3DC4]/10 to-[#6366F1]/10 border border-[#3D3DC4]/20 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-[#3D3DC4] mb-2 flex items-center gap-2">
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
