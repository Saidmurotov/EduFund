import { Bell } from "lucide-react";

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  const first = parts[0]?.[0] || "U";
  const second = parts.length > 1 ? parts[1]?.[0] : "";
  return (first + second).toUpperCase();
}

export default function GreetingHeader({ name, count }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-xl font-semibold text-slate-50">
          Welcome back, {name || "Student"} <span className="inline-block">👋</span>
        </div>
        <div className="text-sm text-[#2563EB] mt-1">
          Sizga {count} ta mos grant topildi
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="h-10 w-10 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center text-slate-200 hover:border-slate-400 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <div className="h-10 w-10 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center text-[#2563EB] font-bold">
          {initials(name)}
        </div>
      </div>
    </div>
  );
}

