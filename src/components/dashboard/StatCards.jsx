import { useEffect, useState } from "react";
import Card from "../ui/Card.jsx";
import { Bookmark, Calendar } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { db } from "../../lib/firebase.js";
import { collection, getDocs } from "firebase/firestore";
import { daysUntil } from "../../lib/utils.js";
import { api, withAuth } from "../../lib/api.js";

function StatCard({ title, value, Icon }) {
  return (
    <Card className="flex-1 min-w-[200px] bg-[#1E293B] border-[#334155] rounded-xl p-[1rem]">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-[#64748B] font-semibold tracking-wide">
            {title}
          </div>
          <div className="text-lg font-semibold text-slate-50 mt-1">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-xl bg-[#0F172A] border border-[#334155] flex items-center justify-center text-slate-200">
          <Icon size={18} />
        </div>
      </div>
    </Card>
  );
}

export default function StatCards() {
  const { user, getIdToken } = useAuth();
  const [savedCount, setSavedCount] = useState(0);
  const [deadlineCount, setDeadlineCount] = useState(0);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!user?.uid) return;

      try {
        // Count saved grants
        if (db) {
          const savedSnap = await getDocs(
            collection(db, "savedGrants", user.uid, "items")
          );
          if (!alive) return;
          setSavedCount(savedSnap.size || 0);
        }

        // Count upcoming deadlines (this week)
        const headers = await withAuth(getIdToken);
        const res = await api.get(`/grants/match/${user.uid}`, { headers });
        if (!alive) return;
        const grants = Array.isArray(res.data) ? res.data : [];
        const upcoming = grants.filter((g) => {
          const days = daysUntil(g.deadline);
          return typeof days === "number" && days >= 0 && days <= 7;
        });
        setDeadlineCount(upcoming.length);
      } catch (e) {
        console.error("[StatCards] load error:", e);
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
