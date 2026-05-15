import NotificationBell from "../layout/NotificationBell.jsx";
import { initials } from "../../lib/utils.js";

export default function GreetingHeader({ name, count }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Welcome back, {name || "Student"} <span className="inline-block">{"\uD83D\uDC4B"}</span>
        </div>
        <div className="text-sm text-[#3D3DC4] mt-1 font-medium">
          Sizga {count} ta mos grant topildi
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="h-10 w-10 rounded-full bg-[#3D3DC4]/15 border border-[#3D3DC4]/30 flex items-center justify-center text-[#3D3DC4] font-bold">
          {initials(name)}
        </div>
      </div>
    </div>
  );
}
