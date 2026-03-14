import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth.js";
import { db } from "../lib/firebase.js";
import CustomYearPicker from "../components/ui/CustomYearPicker.jsx";
import {
  Shield,
  Briefcase,
  Globe,
  Users,
  Award,
  Microscope,
  ClipboardList,
  ArrowRightLeft,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";

/* ─── Constants ─── */

const REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Andijon",
  "Buxoro",
  "Farg'ona",
  "Jizzax",
  "Qashqadaryo",
  "Xorazm",
  "Namangan",
  "Navoiy",
  "Samarqand",
  "Sirdaryo",
  "Surxondaryo",
  "Qoraqalpog'iston",
  "Xorijda yashayman",
];

const EDUCATION_LEVELS = [
  { label: "High School", value: "high_school" },
  { label: "Bachelor", value: "bachelor" },
  { label: "Master", value: "master" },
  { label: "PhD", value: "phd" },
];

const FIELDS = [
  "IT & CS",
  "Business",
  "Engineering",
  "Medical",
  "Arts",
  "Law",
  "Economics",
  "Education",
  "Other",
];

const LANG_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LANG_TYPES = ["Ingliz", "Nemis", "Koreys", "Fransuz", "Boshqa"];

const GOALS = [
  { value: "full_grant", label: "Full Grant", Icon: Shield },
  { value: "internship", label: "Internship", Icon: Briefcase },
  { value: "language", label: "Learn Language", Icon: Globe },
  { value: "networking", label: "Networking", Icon: Users },
  { value: "conference", label: "Conference", Icon: Award },
  { value: "research", label: "Research", Icon: Microscope },
  { value: "stajirovka", label: "Stajirovka", Icon: ClipboardList },
  { value: "exchange", label: "Exchange Program", Icon: ArrowRightLeft },
];

const TARGET_COUNTRIES = [
  { name: "USA", flag: "🇺🇸" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "UK", flag: "🇬🇧" },
  { name: "South Korea", flag: "🇰🇷" },
  { name: "Turkey", flag: "🇹🇷" },
  { name: "China", flag: "🇨🇳" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "France", flag: "🇫🇷" },
  { name: "Austria", flag: "🇦🇹" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Other", flag: "🌍" },
];

/* ─── Tiny shared UI ─── */

function Pill({ active, children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200",
        active
          ? "border-[#3D3DC4] bg-[#3D3DC4]/8 text-[#3D3DC4]"
          : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#D1D5DB]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function InputField({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#374151]">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl bg-white border-2 border-[#E5E7EB] px-4 py-3 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#3D3DC4] focus:ring-2 focus:ring-[#3D3DC4]/20 transition-all";

/* ─── Step Indicator ─── */

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        {Array.from({ length: total }, (_, i) => {
          const step = i + 1;
          const done = step < current;
          const active = step === current;
          return (
            <div key={step} className="flex items-center gap-2">
              <div
                className={[
                  "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                  done
                    ? "bg-[#3D3DC4] text-white"
                    : active
                      ? "border-2 border-[#3D3DC4] text-[#3D3DC4] bg-white"
                      : "bg-[#E5E7EB] text-[#9CA3AF]",
                ].join(" ")}
              >
                {done ? <Check size={16} strokeWidth={3} /> : step}
              </div>
              {step < total && (
                <div
                  className={[
                    "w-8 h-0.5 rounded-full transition-colors",
                    done ? "bg-[#3D3DC4]" : "bg-[#E5E7EB]",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs font-medium text-[#6B7280]">
        🌐 EN
      </div>
    </div>
  );
}

/* ─── Main ─── */

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    region: "",
    degree: "",
    fields: [],
    gpa: "3.0",
    gpaSystem: "4.0",
    ielts: "",
    noIelts: false,
    toefl: "",
    noToefl: false,
    sat: "",
    noSat: false,
    gre: "",
    noGre: false,
    gmat: "",
    noGmat: false,
    languageLevel: "",
    languageType: "",
    goals: [],
    targetCountries: [],
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleArr = (k, value) => {
    setForm((p) => {
      const arr = new Set(p[k]);
      if (arr.has(value)) arr.delete(value);
      else arr.add(value);
      return { ...p, [k]: Array.from(arr) };
    });
  };

  const next = () => {
    setError("");
    setAnimKey((k) => k + 1);
    setStep((s) => Math.min(4, s + 1));
  };
  const back = () => {
    setError("");
    setAnimKey((k) => k + 1);
    setStep((s) => Math.max(1, s - 1));
  };

  const finish = async () => {
    setError("");
    if (!user?.uid) {
      setError("Avval login qiling.");
      return;
    }
    if (!db) {
      setError("Firebase sozlanmagan.");
      return;
    }

    setSaving(true);
    try {
      const ref = doc(db, "users", user.uid);
      await setDoc(
        ref,
        {
          preferences: {
            name: form.name,
            age: form.age ? Number(form.age) : null,
            gender: form.gender,
            region: form.region,
            degree: form.degree,
            fields: form.fields,
            gpa: form.gpa ? Number(form.gpa) : null,
            gpaSystem: form.gpaSystem,
            ielts: form.noIelts ? null : form.ielts ? Number(form.ielts) : null,
            toefl: form.noToefl ? null : form.toefl ? Number(form.toefl) : null,
            sat: form.noSat ? null : form.sat ? Number(form.sat) : null,
            gre: form.noGre ? null : form.gre ? Number(form.gre) : null,
            gmat: form.noGmat ? null : form.gmat ? Number(form.gmat) : null,
            languageLevel: form.languageLevel,
            languageType: form.languageType,
            goals: form.goals,
            targetCountries: form.targetCountries,
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

  /* ─── STEP 1: Personal Info ─── */
  const Step1 = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB]">
      <h2 className="text-xl font-bold text-[#1A1A2E]">Personal Info</h2>
      <p className="text-sm text-[#9CA3AF] mt-1">Shaxsiy ma'lumotlaringizni kiriting</p>

      <div className="mt-6 space-y-5">
        <InputField label="To'liq ism">
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ism Familiya"
          />
        </InputField>

        <InputField label="Tug'ilgan yilingiz">
          <CustomYearPicker
            value={form.age}
            onChange={(val) => set("age", val)}
            min={1975}
            max={2007}
          />
        </InputField>

        <InputField label="Jinsi">
          <div className="flex gap-3">
            <Pill
              active={form.gender === "male"}
              onClick={() => set("gender", "male")}
              className="flex-1"
            >
              Erkak
            </Pill>
            <Pill
              active={form.gender === "female"}
              onClick={() => set("gender", "female")}
              className="flex-1"
            >
              Ayol
            </Pill>
          </div>
        </InputField>

        <InputField label="Viloyat">
          <select
            className={inputClass}
            value={form.region}
            onChange={(e) => set("region", e.target.value)}
          >
            <option value="">Tanlang</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </InputField>
      </div>
    </div>
  );

  /* ─── STEP 2: Education & Field ─── */
  const Step2 = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB]">
      <h2 className="text-xl font-bold text-[#1A1A2E]">Education & Field</h2>
      <p className="text-sm text-[#9CA3AF] mt-1">Ta'lim darajangiz va yo'nalishingiz</p>

      <div className="mt-6 space-y-6">
        <div>
          <div className="text-sm font-medium text-[#374151] mb-3">Education Level</div>
          <div className="grid grid-cols-2 gap-3">
            {EDUCATION_LEVELS.map((d) => (
              <Pill
                key={d.value}
                active={form.degree === d.value}
                onClick={() => set("degree", d.value)}
              >
                {d.label}
              </Pill>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-[#374151] mb-3">
            Field of Study{" "}
            <span className="text-[#9CA3AF] font-normal">(ko'p tanlash mumkin)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {FIELDS.map((f) => (
              <Pill
                key={f}
                active={form.fields.includes(f)}
                onClick={() => toggleArr("fields", f)}
              >
                {f}
              </Pill>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── STEP 3: Academic & Test Scores ─── */
  const Step3 = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB]">
      <h2 className="text-xl font-bold text-[#1A1A2E]">Your Academic Profile</h2>
      <p className="text-sm text-[#9CA3AF] mt-1">
        Bu ma'lumotlar sizga mos grantlarni topishda yordam beradi
      </p>

      <div className="mt-6 space-y-5">
        {/* GPA */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-[#374151]">GPA</label>
            <div className="flex gap-1 bg-[#F3F4F6] rounded-lg p-0.5">
              {["4.0", "100"].map((sys) => (
                <button
                  key={sys}
                  type="button"
                  onClick={() => set("gpaSystem", sys)}
                  className={[
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                    form.gpaSystem === sys
                      ? "bg-white text-[#3D3DC4] shadow-sm"
                      : "text-[#6B7280]",
                  ].join(" ")}
                >
                  {sys} sistema
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <input
              type="range"
              min={0}
              max={form.gpaSystem === "4.0" ? 4 : 100}
              step={form.gpaSystem === "4.0" ? 0.1 : 1}
              value={form.gpa}
              onChange={(e) => set("gpa", e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#3D3DC4]"
            />
            <input
              className={inputClass}
              type="number"
              min={0}
              max={form.gpaSystem === "4.0" ? 4 : 100}
              step={form.gpaSystem === "4.0" ? 0.1 : 1}
              value={form.gpa}
              onChange={(e) => set("gpa", e.target.value)}
              placeholder={form.gpaSystem === "4.0" ? "3.5" : "85"}
            />
          </div>
        </div>

        {/* IELTS */}
        <TestInput
          label="IELTS"
          value={form.ielts}
          onChange={(v) => set("ielts", v)}
          noTest={form.noIelts}
          onToggle={() => set("noIelts", !form.noIelts)}
          min={0}
          max={9}
          step={0.5}
          placeholder="6.5"
        />

        {/* TOEFL */}
        <TestInput
          label="TOEFL"
          value={form.toefl}
          onChange={(v) => set("toefl", v)}
          noTest={form.noToefl}
          onToggle={() => set("noToefl", !form.noToefl)}
          min={0}
          max={120}
          step={1}
          placeholder="90"
        />

        {/* SAT */}
        <TestInput
          label="SAT"
          value={form.sat}
          onChange={(v) => set("sat", v)}
          noTest={form.noSat}
          onToggle={() => set("noSat", !form.noSat)}
          min={400}
          max={1600}
          step={10}
          placeholder="1200"
        />

        {/* GRE */}
        <TestInput
          label="GRE"
          value={form.gre}
          onChange={(v) => set("gre", v)}
          noTest={form.noGre}
          onToggle={() => set("noGre", !form.noGre)}
          min={260}
          max={340}
          step={1}
          placeholder="310"
        />

        {/* GMAT */}
        <TestInput
          label="GMAT"
          value={form.gmat}
          onChange={(v) => set("gmat", v)}
          noTest={form.noGmat}
          onToggle={() => set("noGmat", !form.noGmat)}
          min={200}
          max={800}
          step={10}
          placeholder="650"
        />

        {/* Language Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Til darajasi">
            <select
              className={inputClass}
              value={form.languageLevel}
              onChange={(e) => set("languageLevel", e.target.value)}
            >
              <option value="">Tanlang</option>
              {LANG_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </InputField>
          <InputField label="Qaysi til?">
            <select
              className={inputClass}
              value={form.languageType}
              onChange={(e) => set("languageType", e.target.value)}
            >
              <option value="">Tanlang</option>
              {LANG_TYPES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </InputField>
        </div>

        <div className="flex items-start gap-3 bg-[#EEF2FF] border border-[#C7D2FE] rounded-xl px-4 py-3">
          <span className="text-lg">💡</span>
          <p className="text-sm text-[#3D3DC4] font-medium">
            Ko'proq ma'lumot = Ko'proq mos grantlar
          </p>
        </div>
      </div>
    </div>
  );

  /* ─── STEP 4: Goals & Target Countries ─── */
  const Step4 = () => (
    <div className="space-y-5">
      {/* Goals */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB]">
        <h2 className="text-xl font-bold text-[#1A1A2E]">What are you looking for?</h2>
        <p className="text-sm text-[#9CA3AF] mt-1">Ko'p tanlash mumkin</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {GOALS.map(({ value, label, Icon }) => {
            const active = form.goals.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleArr("goals", value)}
                className={[
                  "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200",
                  active
                    ? "border-[#3D3DC4] bg-[#3D3DC4]/5"
                    : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]",
                ].join(" ")}
              >
                <div
                  className={[
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                    active ? "bg-[#3D3DC4]/10 text-[#3D3DC4]" : "bg-[#F3F4F6] text-[#9CA3AF]",
                  ].join(" ")}
                >
                  <Icon size={20} />
                </div>
                <span
                  className={[
                    "text-sm font-medium",
                    active ? "text-[#3D3DC4]" : "text-[#374151]",
                  ].join(" ")}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Countries */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB]">
        <h2 className="text-xl font-bold text-[#1A1A2E]">Target Countries</h2>
        <p className="text-sm text-[#9CA3AF] mt-1">Qaysi davlatlarga qiziqasiz?</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {TARGET_COUNTRIES.map(({ name, flag }) => {
            const active = form.targetCountries.includes(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleArr("targetCountries", name)}
                className={[
                  "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                  active
                    ? "border-[#3D3DC4] bg-[#3D3DC4]/5"
                    : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]",
                ].join(" ")}
              >
                <span className="text-2xl">{flag}</span>
                <span
                  className={[
                    "text-sm font-medium",
                    active ? "text-[#3D3DC4]" : "text-[#374151]",
                  ].join(" ")}
                >
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const stepContent = [null, Step1, Step2, Step3, Step4];
  const CurrentStep = stepContent[step];

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepIndicator current={step} total={4} />

        <div
          key={animKey}
          className="animate-[fadeSlide_300ms_ease-out]"
        >
          {CurrentStep && <CurrentStep />}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 1 || saving}
            className="flex items-center gap-1 text-sm font-medium text-[#6B7280] hover:text-[#374151] disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={next}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3D3DC4] text-white text-sm font-semibold hover:bg-[#3232a8] disabled:opacity-60 transition-all shadow-lg shadow-[#3D3DC4]/25"
            >
              CONTINUE <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3D3DC4] text-white text-sm font-semibold hover:bg-[#3232a8] disabled:opacity-60 transition-all shadow-lg shadow-[#3D3DC4]/25"
            >
              {saving ? "Saqlanmoqda..." : "FINISH"} <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ─── Test Input Component ─── */
function TestInput({ label, value, onChange, noTest, onToggle, min, max, step, placeholder }) {
  return (
    <InputField label={label}>
      <div className="flex gap-3 items-center">
        <input
          className={[inputClass, noTest ? "opacity-40" : ""].join(" ")}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={noTest}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-[#6B7280] mt-2 cursor-pointer">
        <input
          type="checkbox"
          checked={noTest}
          onChange={onToggle}
          className="accent-[#3D3DC4] h-4 w-4"
        />
        Hali topshirmaganman
      </label>
    </InputField>
  );
}
