import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { db } from "../lib/firebase.js";

const YEARS = Array.from({ length: 2010 - 1990 + 1 }, (_, i) => 1990 + i);
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
const GRANT_TYPES = ["Full Fund", "Partial", "Internship", "Exchange"];

const DEGREE_CHOICES = [
  { label: "Bakalavr", value: "bachelor" },
  { label: "Magistr", value: "master" },
  { label: "PhD", value: "phd" },
];

function degreeLabel(value) {
  return DEGREE_CHOICES.find((d) => d.value === value)?.label || value || "-";
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
          : "bg-[#1E293B] border-[#334155] text-slate-200 hover:border-slate-400",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StepShell({ title, subtitle, children }) {
  return (
    <Card className="bg-[#1E293B] border-[#334155] rounded-2xl">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-50">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    birthYear: "",
    degree: "",
    field: "",
    gpa: 3.0,
    ielts: 6.5,
    noIelts: false,
    countries: [],
    grantTypes: [],
  });

  const progress = useMemo(() => Math.round(((currentStep - 1) / 4) * 100), [
    currentStep,
  ]);

  const setField = (k, v) => setFormData((p) => ({ ...p, [k]: v }));

  const toggleInArray = (k, value) => {
    setFormData((p) => {
      const arr = new Set(p[k]);
      if (arr.has(value)) arr.delete(value);
      else arr.add(value);
      return { ...p, [k]: Array.from(arr) };
    });
  };

  const next = () => {
    setError("");
    setAnimKey((k) => k + 1);
    setCurrentStep((s) => Math.min(5, s + 1));
  };

  const back = () => {
    setError("");
    setAnimKey((k) => k + 1);
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  const start = async () => {
    setError("");
    if (!user?.uid) {
      setError("Avval login qiling.");
      return;
    }
    if (!db) {
      setError("Firebase sozlanmagan. `.env` ni to'ldiring.");
      return;
    }

    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          preferences: {
            fullName: formData.fullName,
            birthYear: formData.birthYear ? Number(formData.birthYear) : null,
            degree: formData.degree, // canonical: bachelor|master|phd
            field: formData.field,
            gpa: Number(formData.gpa),
            ielts: formData.noIelts ? null : Number(formData.ielts),
            noIelts: Boolean(formData.noIelts),
            countries: formData.countries,
            grantTypes: formData.grantTypes,
          },
        },
        { merge: true }
      );
      navigate("/dashboard");
    } catch (e) {
      console.error(e);
      setError("Saqlashda xato yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setSaving(false);
    }
  };

  const stepContent = () => {
    if (currentStep === 1) {
      return (
        <StepShell
          title="Shaxsiy ma'lumot"
          subtitle="Asosiy ma'lumotlaringizni kiriting."
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-200">To'liq ism</label>
              <input
                className="w-full rounded-lg bg-[#0F172A] border border-[#334155] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                value={formData.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                placeholder="Ism Familiya"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Tug'ilgan yil</label>
              <select
                className="w-full rounded-lg bg-[#0F172A] border border-[#334155] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                value={formData.birthYear}
                onChange={(e) => setField("birthYear", e.target.value)}
              >
                <option value="">Tanlang</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </StepShell>
      );
    }

    if (currentStep === 2) {
      return (
        <StepShell title="Ta'lim darajasi" subtitle="Hozirgi darajangizni tanlang.">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DEGREE_CHOICES.map((d) => {
                const selected = formData.degree === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setField("degree", d.value)}
                    className={[
                      "text-left rounded-2xl border p-4 transition-colors",
                      selected
                        ? "border-[#2563EB] bg-[#2563EB]/10"
                        : "border-[#334155] bg-[#1E293B] hover:border-slate-400",
                    ].join(" ")}
                  >
                    <div className="text-slate-50 font-semibold">{d.label}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Tanlash uchun bosing
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200">Ixtisoslik</label>
              <input
                className="w-full rounded-lg bg-[#0F172A] border border-[#334155] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                value={formData.field}
                onChange={(e) => setField("field", e.target.value)}
                placeholder='Masalan: "Computer Science"'
              />
            </div>
          </div>
        </StepShell>
      );
    }

    if (currentStep === 3) {
      return (
        <StepShell
          title="Akademik ko'rsatkichlar"
          subtitle="GPA va IELTS ma'lumotlarini kiriting."
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-200">GPA</label>
                <span className="text-sm text-slate-300">{formData.gpa}</span>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="range"
                  min={0}
                  max={4}
                  step={0.1}
                  value={formData.gpa}
                  onChange={(e) => setField("gpa", Number(e.target.value))}
                  className="w-full"
                />
                <input
                  type="number"
                  min={0}
                  max={4}
                  step={0.1}
                  value={formData.gpa}
                  onChange={(e) => setField("gpa", Number(e.target.value))}
                  className="w-24 rounded-lg bg-[#0F172A] border border-[#334155] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-200">IELTS</label>
                <span className="text-sm text-slate-300">
                  {formData.noIelts ? "-" : formData.ielts}
                </span>
              </div>

              <div className="flex gap-3 items-center">
                <input
                  type="range"
                  min={0}
                  max={9}
                  step={0.5}
                  value={formData.ielts}
                  onChange={(e) => setField("ielts", Number(e.target.value))}
                  disabled={formData.noIelts}
                  className="w-full disabled:opacity-40"
                />
                <input
                  type="number"
                  min={0}
                  max={9}
                  step={0.5}
                  value={formData.ielts}
                  onChange={(e) => setField("ielts", Number(e.target.value))}
                  disabled={formData.noIelts}
                  className="w-24 rounded-lg bg-[#0F172A] border border-[#334155] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-40"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-200 mt-2">
                <input
                  type="checkbox"
                  checked={formData.noIelts}
                  onChange={(e) => setField("noIelts", e.target.checked)}
                  className="accent-[#2563EB]"
                />
                Hali IELTS topshirmaganman
              </label>
            </div>
          </div>
        </StepShell>
      );
    }

    if (currentStep === 4) {
      return (
        <StepShell title="Maqsad" subtitle="Davlatlar va grant turini tanlang.">
          <div className="space-y-5">
            <div>
              <div className="text-sm text-slate-200 mb-2">Maqsad davlatlar</div>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map((c) => (
                  <Chip
                    key={c}
                    active={formData.countries.includes(c)}
                    onClick={() => toggleInArray("countries", c)}
                  >
                    {c}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-200 mb-2">Grant turi</div>
              <div className="flex flex-wrap gap-2">
                {GRANT_TYPES.map((t) => (
                  <Chip
                    key={t}
                    active={formData.grantTypes.includes(t)}
                    onClick={() => toggleInArray("grantTypes", t)}
                  >
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </StepShell>
      );
    }

    return (
      <StepShell title="Tasdiqlash" subtitle="Kiritilgan ma'lumotlarni tekshiring.">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Ism</span>
            <span className="text-slate-100 font-medium">
              {formData.fullName || "-"}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Tug'ilgan yil</span>
            <span className="text-slate-100 font-medium">
              {formData.birthYear || "-"}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Daraja</span>
            <span className="text-slate-100 font-medium">
              {degreeLabel(formData.degree)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Soha</span>
            <span className="text-slate-100 font-medium">
              {formData.field || "-"}
            </span>
          </div>
        </div>
      </StepShell>
    );
  };

  return (
    <div className="py-8">
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">
            {currentStep} of 5
          </div>
          <div className="text-sm text-slate-400">{progress}%</div>
        </div>
        <div className="mt-2 h-2 rounded-full bg-[#1E293B] overflow-hidden border border-[#334155]">
          <div
            className="h-full bg-[#2563EB] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div
        key={animKey}
        className="transition-all duration-300 ease-out animate-[fadeSlide_300ms_ease-out]"
      >
        {stepContent()}
      </div>

      {error && (
        <p className="mt-4 text-sm text-[#EF4444] bg-[#1E293B] border border-[#EF4444]/40 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={back}
          disabled={currentStep === 1 || saving}
        >
          Orqaga
        </Button>

        {currentStep < 5 ? (
          <Button type="button" onClick={next} disabled={saving}>
            Keyingi
          </Button>
        ) : (
          <Button type="button" onClick={start} disabled={saving}>
            {saving ? "Saqlanmoqda..." : "Boshlash"}
          </Button>
        )}
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

