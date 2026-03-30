import { useEffect, useState } from "react";
import GreetingHeader from "../components/dashboard/GreetingHeader.jsx";
import StatCards from "../components/dashboard/StatCards.jsx";
import GrantList from "../components/dashboard/GrantList.jsx";
import { SkeletonDashboard } from "../components/ui/Skeleton.jsx";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase.js";
import { useAuth } from "../hooks/useAuth.js";

export default function Dashboard() {
  const { user } = useAuth();
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
        const querySnapshot = await getDocs(collection(db, "grants"));
        const allGrants = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const userGpa = parseFloat(user?.gpa || user?.preferences?.gpa || 0);
        const userCategory = user?.category || user?.preferences?.category || "";
        const userFields = user?.preferences?.fields || [];

        // Filtrlash (Matching logic)
        const filteredGrants = allGrants.filter(grant => {
          // 1. GPA tekshiruvi
          const grantMinGpa = parseFloat(grant.min_gpa || grant.minGPA || 0);
          if (userGpa > 0 && grantMinGpa > 0 && userGpa < grantMinGpa) {
            return false;
          }

          // 2. Yo'nalish text tekshiruvi (Category)
          const grantCategory = grant.category || grant.field || grant.fields || "";
          const grantCatStr = Array.isArray(grantCategory) ? grantCategory.join(" ").toLowerCase() : grantCategory.toLowerCase();
          
          if (grantCatStr && grantCatStr !== "all fields" && grantCatStr !== "barcha yo'nalishlar" && grantCatStr !== "all") {
            let matched = false;
            
            if (userCategory && grantCatStr.includes(userCategory.toLowerCase())) {
              matched = true;
            }
            if (userFields.length > 0 && userFields.some(f => grantCatStr.includes(f.toLowerCase()))) {
              matched = true;
            }

            // Agar user kategoriya ko'rsatgan bo'lsa va mos kelmasa:
            if ((userCategory || userFields.length > 0) && !matched) {
              return false;
            }
          }

          return true;
        });

        // 3. Deadline bo'yicha eng yaqinidan uzog'iga saralash
        filteredGrants.sort((a, b) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline) - new Date(b.deadline);
        });

        if (!alive) return;
        setGrants(filteredGrants);
      } catch (e) {
        console.error("Firestore'dan grantlarni yuklashda xato:", e);
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
  }, [user]);

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
            {grants.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-[#1E293B] border border-[#334155] rounded-2xl text-center">
                <span className="text-4xl mb-4">📭</span>
                <h3 className="text-lg font-bold text-slate-100 mb-2">Hozircha grantlar mavjud emas</h3>
                <p className="text-sm text-slate-400">Tez orada yangi grantlar qo'shiladi yoki filtringizga mos grant hozircha yo'q.</p>
              </div>
            ) : (
              <GrantList grants={grants} />
            )}
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
