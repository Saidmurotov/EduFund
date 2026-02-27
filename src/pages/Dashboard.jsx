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
    <div className="py-8 space-y-4">
      <GreetingHeader name={user?.name || user?.email} count={grants.length} />
      <StatCards />
      {error ? (
        <div className="text-sm text-[#EF4444] bg-[#1E293B] border border-[#EF4444]/40 rounded-lg px-3 py-2">
          {error}
        </div>
      ) : (
        <GrantList grants={grants} />
      )}
    </div>
  );
}

