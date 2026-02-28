import { NavLink } from "react-router-dom";
import { Calendar, Home, MessageCircle, Search, User } from "lucide-react";

const tabs = [
  { to: "/dashboard", label: "Home", Icon: Home },
  { to: "/search", label: "Search", Icon: Search },
  { to: "/chat", label: "AI Chat", Icon: MessageCircle, primary: true },
  { to: "/calendar", label: "Calendar", Icon: Calendar },
  { to: "/profile", label: "Profile", Icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t border-[#334155] bg-[#0F172A]/90 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-4 py-2 flex items-end justify-between">
        {tabs.map(({ to, label, Icon, primary }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                primary ? "relative -mt-4" : "",
                isActive ? "text-[#3D3DC4]" : "text-[#64748B]",
              ].join(" ")
            }
          >
            <div
              className={[
                "flex items-center justify-center",
                primary
                  ? "h-12 w-12 rounded-full bg-[#3D3DC4] text-white shadow-lg shadow-[#3D3DC4]/40"
                  : "h-10 w-10 rounded-full",
              ].join(" ")}
            >
              <Icon size={primary ? 22 : 18} />
            </div>
            <span className={primary ? "text-slate-200" : ""}>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

