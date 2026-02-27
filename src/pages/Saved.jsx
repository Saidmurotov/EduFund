import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { db } from "../lib/firebase.js";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

function SavedGrantRow({ item, onRemove }) {
  const g = item.grantData || {};
  return (
    <Card className="bg-[#1E293B] border-[#334155] rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-slate-50 font-semibold truncate">
            {g.title || "Grant"}
          </div>
          <div className="text-sm text-[#64748B] mt-1 truncate">
            {g.country || "-"} • {g.organization || "-"}
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="h-9 w-9 rounded-full bg-[#0F172A] border border-[#334155] flex items-center justify-center text-slate-200 hover:border-slate-400"
          aria-label="Remove"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {g.fundingType && <Badge variant="green">{g.fundingType}</Badge>}
        {g.degree && (
          <Badge variant="blue">
            {Array.isArray(g.degree) ? g.degree.join(", ") : g.degree}
          </Badge>
        )}
        {g.field && (
          <Badge variant="outline">
            {Array.isArray(g.field) ? g.field[0] : g.field}
          </Badge>
        )}
      </div>

      <div className="mt-3 text-sm text-[#64748B]">
        Saved: {item.savedAt ? new Date(item.savedAt).toLocaleString() : "-"}
      </div>
    </Card>
  );
}

export default function Saved() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [sort, setSort] = useState("savedAt");

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!user?.uid) return;
      setLoading(true);
      setError("");
      try {
        if (!db) throw new Error("Firebase not configured");
        const col = collection(db, "savedGrants", user.uid, "items");
        const q = query(col, orderBy("savedAt", "desc"));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (!alive) return;
        setItems(list);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError("Saqlangan grantlarni olishda xato yuz berdi.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [user?.uid]);

  const sorted = useMemo(() => {
    const arr = [...items];
    if (sort === "deadline") {
      arr.sort(
        (a, b) =>
          new Date(a.grantData?.deadline || 0) -
          new Date(b.grantData?.deadline || 0)
      );
    } else {
      arr.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
    }
    return arr;
  }, [items, sort]);

  const remove = async (itemId) => {
    if (!user?.uid || !db) return;
    try {
      await deleteDoc(doc(db, "savedGrants", user.uid, "items", itemId));
      setItems((p) => p.filter((x) => x.id !== itemId));
    } catch (e) {
      console.error(e);
      setError("O'chirishda xato yuz berdi.");
    }
  };

  const count = sorted.length;

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xl font-semibold text-slate-50">
          Saqlangan Grantlar ({count} ta)
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg bg-[#1E293B] border border-[#334155] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        >
          <option value="savedAt">Saqlangan sana</option>
          <option value="deadline">Deadline</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-32 rounded-2xl bg-[#1E293B] border border-[#334155] animate-pulse" />
          <div className="h-32 rounded-2xl bg-[#1E293B] border border-[#334155] animate-pulse" />
        </div>
      ) : error ? (
        <div className="text-sm text-[#EF4444] bg-[#1E293B] border border-[#EF4444]/40 rounded-lg px-3 py-2">
          {error}
        </div>
      ) : count === 0 ? (
        <Card className="bg-[#1E293B] border-[#334155] rounded-2xl">
          <div className="text-slate-50 font-semibold">
            Hali hech narsa saqlanmagan
          </div>
          <div className="text-sm text-slate-400 mt-1">
            Grantlarni qidirib, o'zingizga moslarini saqlang.
          </div>
          <div className="mt-3">
            <Button type="button" onClick={() => navigate("/search")}>
              Grantlarni ko'rish
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((it) => (
            <SavedGrantRow key={it.id} item={it} onRemove={() => remove(it.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

