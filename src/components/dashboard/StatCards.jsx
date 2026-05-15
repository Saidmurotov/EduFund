import { useEffect, useState } from "react";
import Card from "../ui/Card.jsx";
import { Bookmark, Calendar, Database } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { db, auth } from "../../lib/firebase.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import { daysUntil } from "../../lib/utils.js";
import { api, withAuth } from "../../lib/api.js";

function StatCard({ title, value, Icon }) {
  return (
    <Card className="flex-1 min-w-[200px] bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] rounded-xl p-[1rem] shadow-sm dark:shadow-none">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500 dark:text-[#64748B] font-semibold tracking-wide">
            {title}
          </div>
          <div className="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-1">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-center justify-center text-slate-600 dark:text-slate-200">
          <Icon size={18} />
        </div>
      </div>
    </Card>
  );
}

export default function StatCards({ totalGrants = 0 }) {
  const { user, getIdToken } = useAuth();
  const [savedCount, setSavedCount] = useState(0);
  const [deadlineCount, setDeadlineCount] = useState(0);

  useEffect(() => {
    let alive = true;
    async function load() {
      const currentUser = auth.currentUser;
      if (!currentUser?.uid) return;

      try {
        if (db) {
          try {
            const q = query(
              collection(db, "savedGrants", currentUser.uid, "items"),
              where("userId", "==", currentUser.uid)
            );
            const savedSnap = await getDocs(q);
            if (!alive) return;
            setSavedCount(savedSnap.size || 0);
          } catch (e) {
            console.error("Error fetching saved grants:", e);
            if (alive) setSavedCount(0);
          }
        }

        // Count upcoming deadlines (this week)
        const headers = await withAuth(getIdToken);
        const res = await api.get(`/grants/match/${currentUser.uid}`, { headers });
        if (!alive) return;
        const grantsList = Array.isArray(res.data) ? res.data : [];
        const upcoming = grantsList.filter((g) => {
          const days = daysUntil(g.deadline);
          return typeof days === "number" && days >= 0 && days <= 7;
        });
        setDeadlineCount(upcoming.length);
      } catch (e) {
        console.error("[StatCards] load error (Permissions or structure):", e);
        if (alive) {
          setSavedCount(0);
          setDeadlineCount(0);
        }
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [user?.uid, getIdToken]);

  return (
    <div className="flex flex-wrap gap-[0.75rem]">
      <StatCard
        title="JAMI GRANTLAR"
        value={`${totalGrants} ta bazada`}
        Icon={Database}
      />
      <StatCard
        title="SAQLANGAN"
        value={`${savedCount} ta grant`}
        Icon={Bookmark}
      />
      <StatCard
        title="DEADLINELAR"
        value={`${deadlineCount} ta shu hafta`}
        Icon={Calendar}
      />
    </div>
  );
}
