import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth.js";
import { db } from "../lib/firebase.js";
import CustomYearPicker from "../components/ui/CustomYearPicker.jsx";
import FieldSelector from "../components/ui/FieldSelector.jsx";
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
    field: "",
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
      const ref = doc(db, "userProfiles", user.uid);
      await setDoc(
        ref,
        {
          preferences: {
            name: form.name,
            age: form.age ? Number(form.age) : null,
            gender: form.gender,
            region: form.region,
            degree: form.degree,
            field: form.field,
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
            Ixtisoslik (Field of Study)
          </div>
          <FieldSelector
            value={form.field}
            onChange={(val) => set("field", val)}
          />
        </div>
      </div>
    </div>
  );

  /* ─── STEP 3: Academic & Test Scores ─── */
  const Step3 = () => {
    const is100 = form.gpaSystem === "100";
    const gpaMax = is100 ? 100 : 4.0;
    const gpaStep = is100 ? 1 : 0.1;
    const gpaVal = Number(form.gpa) || 0;
    const gpaPercent = ((gpaVal) / gpaMax) * 100;

    const ieltsVal = Number(form.ielts) || 0;
    const ieltsPercent = ((ieltsVal) / 9.0) * 100;

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB]">
        <h2 className="text-xl font-bold text-[#1A1A2E]">Akademik Ko'rsatkichlar</h2>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Bu ma'lumotlar sizga mos grantlarni topishda yordam beradi
        </p>

        <div className="mt-8 space-y-10">
          {/* GPA Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-semibold text-[#1A1A2E]">GPA</span>
              <span className="bg-[#2563EB] text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                {form.gpa || (is100 ? "0" : "0.0")}
              </span>
            </div>
            
            <div className="mb-6 flex gap-2">
              <button
                type="button"
                onClick={() => { set("gpaSystem", "4.0"); set("gpa", "3.0"); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                  !is100 ? "border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]" : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#D1D5DB]"
                }`}
              >
                4.0 tizim
              </button>
              <button
                type="button"
                onClick={() => { set("gpaSystem", "100"); set("gpa", "80"); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                  is100 ? "border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]" : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#D1D5DB]"
                }`}
              >
                100 tizim
              </button>
            </div>

            <div className="relative pt-2">
              <input
                type="range"
                min={0}
                max={gpaMax}
                step={gpaStep}
                value={form.gpa || 0}
                onChange={(e) => set("gpa", e.target.value)}
                className="w-full appearance-none h-2 rounded-full cursor-pointer custom-slider"
                style={{
                  background: `linear-gradient(to right, #2563EB 0%, #2563EB ${gpaPercent}%, #334155 ${gpaPercent}%, #334155 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-[#6B7280] mt-3 px-1 font-medium">
                <span>0{is100 ? "" : ".0"}</span>
                <span>{is100 ? "50" : "2.0"}</span>
                <span>{is100 ? "100" : "4.0"}</span>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-[#E5E7EB]"></div>

          {/* IELTS Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-base font-semibold text-[#1A1A2E]">IELTS</span>
              <label className="flex items-center gap-2 text-sm text-[#6B7280] font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.noIelts}
                  onChange={() => set("noIelts", !form.noIelts)}
                  className="w-4 h-4 rounded border-[#D1D5DB] text-[#2563EB] focus:ring-[#2563EB] accent-[#2563EB] cursor-pointer"
                />
                Hali topshirmaganman
              </label>
            </div>

            <div className={`transition-opacity duration-300 ${form.noIelts ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
              <div className="flex justify-end mb-4">
                <span className="bg-[#2563EB] text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                  {form.ielts || "0.0"} / 9.0
                </span>
              </div>
              <div className="relative pt-2">
                <input
                  type="range"
                  min={0}
                  max={9.0}
                  step={0.5}
                  value={form.ielts || 0}
                  onChange={(e) => set("ielts", e.target.value)}
                  disabled={form.noIelts}
                  className="w-full appearance-none h-2 rounded-full cursor-pointer custom-slider"
                  style={{
                    background: `linear-gradient(to right, #2563EB 0%, #2563EB ${ieltsPercent}%, #334155 ${ieltsPercent}%, #334155 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-[#6B7280] mt-3 px-1 font-medium">
                  <span>0.0</span>
                  <span>4.5</span>
                  <span>9.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <style>{`
          .custom-slider::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            box-shadow: 0 0 0 3px #2563EB;
            margin-top: -6px;
          }
          .custom-slider::-webkit-slider-runnable-track {
            height: 8px;
            border-radius: 4px;
            background: transparent;
          }
          .custom-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            box-shadow: 0 0 0 3px #2563EB;
            border: none;
          }
          .custom-slider::-moz-range-track {
            height: 8px;
            border-radius: 4px;
            background: transparent;
          }
        `}</style>
      </div>
    );
  };

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
