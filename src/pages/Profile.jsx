import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { db } from "../lib/firebase.js";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

const COUNTRIES = [
  "Germany",
  "South Korea",
  "USA",
  "UK",
  "Austria",
  "Japan",
  "China",
  "France",
  "Other",
];

const DEGREE_CHOICES = [
  { label: "Bakalavr", value: "bachelor" },
  { label: "Magistr", value: "master" },
  { label: "PhD", value: "phd" },
];

function degreeLabel(value) {
  return DEGREE_CHOICES.find((d) => d.value === value)?.label || value || "-";
}

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
        active
          ? "bg-[#2563EB] border-[#2563EB] text-white"
          : "bg-[#0F172A] border-[#334155] text-slate-200 hover:border-slate-400",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userDoc, setUserDoc] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [viewedCount] = useState(0);

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [language, setLanguage] = useState("uz");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [edit, setEdit] = useState({
    gpa: "",
    ielts: "",
    degree: "",
    field: "",
    countries: [],
  });
  const [saving, setSaving] = useState(false);

  const isPremium = Boolean(userDoc?.isPremium);
  const prefs = userDoc?.preferences || {};

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!user?.uid) return;
      setLoading(true);
      setError("");
      try {
        if (!db) throw new Error("Firebase not configured");

        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        const data = snap.exists() ? snap.data() : null;

        const savedSnap = await getDocs(
          collection(db, "savedGrants", user.uid, "items")
        );

        if (!alive) return;
        setUserDoc(data);
        setSavedCount(savedSnap.size || 0);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError("Profil ma'lumotlarini olishda xato yuz berdi.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [user?.uid]);

  const displayName = userDoc?.name || user?.name || user?.email || "User";
  const email = userDoc?.email || user?.email || "";

  const openEdit = () => {
    setEdit({
      gpa: prefs.gpa ?? "",
      ielts: prefs.ielts ?? "",
      degree: prefs.degree ?? "",
      field: prefs.field ?? "",
      countries: Array.isArray(prefs.countries) ? prefs.countries : [],
    });
    setIsModalOpen(true);
  };

  const toggleCountry = (c) => {
    setEdit((p) => ({
      ...p,
      countries: p.countries.includes(c)
        ? p.countries.filter((x) => x !== c)
        : [...p.countries, c],
    }));
  };

  const savePreferences = async () => {
    if (!user?.uid) return;
    if (!db) {
      setError("Firebase sozlanmagan. `.env` ni to'ldiring.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const ref = doc(db, "users", user.uid);
      await setDoc(
        ref,
        {
          preferences: {
            ...prefs,
            gpa: edit.gpa === "" ? null : Number(edit.gpa),
            ielts: edit.ielts === "" ? null : Number(edit.ielts),
            degree: edit.degree,
            field: edit.field,
            countries: edit.countries,
          },
        },
        { merge: true }
      );
      const snap = await getDoc(ref);
      setUserDoc(snap.exists() ? snap.data() : userDoc);
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      setError("Saqlashda xato yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const premiumBenefits = useMemo(
    () => ["Cheksiz AI chat", "To'liq Roadmap", "CV tekshirish"],
    []
  );

  if (loading) {
    return (
      <div className="py-8 space-y-3">
        <div className="h-28 rounded-2xl bg-[#1E293B] border border-[#334155] animate-pulse" />
        <div className="h-44 rounded-2xl bg-[#1E293B] border border-[#334155] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="py-6 space-y-4">
      {error && (
        <div className="text-sm text-[#EF4444] bg-[#1E293B] border border-[#EF4444]/40 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <Card className="bg-[#1E293B] border-[#334155] rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center text-[#2563EB] font-bold text-xl">
            {initials(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-lg font-semibold text-slate-50 truncate">
                {displayName}
              </div>
              {isPremium && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
                  Premium
                </span>
              )}
            </div>
            <div className="text-sm text-slate-300 truncate">{email}</div>
          </div>
          <Button type="button" onClick={openEdit}>
            Edit Profile
          </Button>
        </div>
      </Card>

      <Card className="bg-[#1E293B] border-[#334155] rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-slate-50">
            Akademik ma'lumotlar
          </div>
          <Button type="button" variant="ghost" onClick={openEdit}>
            Tahrirlash
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">GPA</span>
            <span className="text-slate-100 font-medium">{prefs.gpa ?? "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">IELTS</span>
            <span className="text-slate-100 font-medium">
              {prefs.noIelts ? "Hali yo'q" : prefs.ielts ?? "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Daraja</span>
            <span className="text-slate-100 font-medium">
              {degreeLabel(prefs.degree)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Soha</span>
            <span className="text-slate-100 font-medium">{prefs.field ?? "-"}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-slate-400 mb-2">Maqsad davlatlar</div>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(prefs.countries) && prefs.countries.length
              ? prefs.countries
              : ["-"]
            ).map((c) => (
              <Badge key={c} variant="outline">
                {c}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      <Card className="bg-[#1E293B] border-[#334155] rounded-2xl">
        <div className="text-lg font-semibold text-slate-50">Statistika</div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#0F172A] border border-[#334155] p-3">
            <div className="text-xs text-slate-400 font-semibold">
              Saqlangan grantlar
            </div>
            <div className="text-xl font-bold text-slate-50 mt-1">{savedCount}</div>
          </div>
          <div className="rounded-xl bg-[#0F172A] border border-[#334155] p-3">
            <div className="text-xs text-slate-400 font-semibold">
              Ko'rilgan grantlar
            </div>
            <div className="text-xl font-bold text-slate-50 mt-1">{viewedCount}</div>
          </div>
          <div className="rounded-xl bg-[#0F172A] border border-[#334155] p-3">
            <div className="text-xs text-slate-400 font-semibold">
              Yuborilgan arizalar
            </div>
            <div className="text-xl font-bold text-slate-50 mt-1">0</div>
          </div>
        </div>
      </Card>

      {!isPremium && (
        <Card className="bg-[#1E293B] border-[#334155] rounded-2xl">
          <div className="text-lg font-semibold text-slate-50">
            🚀 Premium ga o'ting
          </div>
          <ul className="mt-3 space-y-1 text-sm text-slate-200">
            {premiumBenefits.map((b) => (
              <li key={b}>- {b}</li>
            ))}
          </ul>
          <div className="mt-4">
            <Button
              type="button"
              className="w-full"
              onClick={() => alert("Hozircha to'lov integratsiyasi yo'q.")}
            >
              29,000 so'm/oy — Obuna bo'lish
            </Button>
          </div>
        </Card>
      )}

      <Card className="bg-[#1E293B] border-[#334155] rounded-2xl">
        <div className="text-lg font-semibold text-slate-50">Sozlamalar</div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-200">Bildirishnomalar</div>
            <button
              type="button"
              onClick={() => setNotifEnabled((p) => !p)}
              className={[
                "w-12 h-7 rounded-full border transition-colors relative",
                notifEnabled
                  ? "bg-[#2563EB] border-[#2563EB]"
                  : "bg-[#0F172A] border-[#334155]",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform",
                  notifEnabled ? "translate-x-6" : "translate-x-1",
                ].join(" ")}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-slate-200">Til</div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg bg-[#0F172A] border border-[#334155] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="uz">O'zbek</option>
              <option value="ru">Rus</option>
              <option value="en">English</option>
            </select>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
          >
            Hisobdan chiqish
          </Button>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0F172A] border border-[#334155] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-semibold text-slate-50">
                Profilni tahrirlash
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
              >
                Yopish
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-slate-200">GPA</label>
                  <input
                    value={edit.gpa}
                    onChange={(e) =>
                      setEdit((p) => ({ ...p, gpa: e.target.value }))
                    }
                    type="number"
                    min={0}
                    max={4}
                    step={0.1}
                    className="w-full rounded-lg bg-[#1E293B] border border-[#334155] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-200">IELTS</label>
                  <input
                    value={edit.ielts}
                    onChange={(e) =>
                      setEdit((p) => ({ ...p, ielts: e.target.value }))
                    }
                    type="number"
                    min={0}
                    max={9}
                    step={0.5}
                    className="w-full rounded-lg bg-[#1E293B] border border-[#334155] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-slate-200">Daraja</label>
                  <select
                    value={edit.degree}
                    onChange={(e) =>
                      setEdit((p) => ({ ...p, degree: e.target.value }))
                    }
                    className="w-full rounded-lg bg-[#1E293B] border border-[#334155] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="">Tanlang</option>
                    {DEGREE_CHOICES.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-200">Soha</label>
                  <input
                    value={edit.field}
                    onChange={(e) =>
                      setEdit((p) => ({ ...p, field: e.target.value }))
                    }
                    className="w-full rounded-lg bg-[#1E293B] border border-[#334155] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    placeholder="Masalan: Computer Science"
                  />
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-200 mb-2">Davlatlar</div>
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.map((c) => (
                    <Chip
                      key={c}
                      active={edit.countries.includes(c)}
                      onClick={() => toggleCountry(c)}
                    >
                      {c}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Bekor qilish
                </Button>
                <Button type="button" onClick={savePreferences} disabled={saving}>
                  {saving ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

