import { NavLink, useNavigate } from "react-router-dom";
import {
    Home,
    Search,
    MessageCircle,
    Calendar,
    User,
    Bookmark,
    BarChart3,
    Crown,
    LogOut,
    Route,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { initials } from "../../lib/utils.js";
import ThemeToggle from "../ui/ThemeToggle.jsx";

const NAV_ITEMS = [
    { to: "/dashboard", label: "Dashboard", Icon: Home },
    { to: "/search", label: "Search", Icon: Search },
    { to: "/chat", label: "AI Chat", Icon: MessageCircle },
    { to: "/calendar", label: "Calendar", Icon: Calendar },
    { to: "/saved", label: "Saved", Icon: Bookmark },
    { to: "/roadmap", label: "Roadmap", Icon: Route },
    { to: "/profile", label: "Profile", Icon: User },
];

const ADMIN_ITEMS = [
    { to: "/admin/stats", label: "Admin Stats", Icon: BarChart3 },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (e) {
            console.error(e);
        }
    };

    const isAdmin = user?.role === "admin";
    const displayName =
        user?.name || user?.displayName || user?.email?.split("@")[0] || "Student";

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 z-40 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors">
            {/* ── Logo ── */}
            <div className="px-5 py-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#3D3DC4] flex items-center justify-center text-white text-sm font-extrabold shadow-lg shadow-[#3D3DC4]/30">
                    EF
                </div>
                <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-slate-50 text-[15px] leading-tight">
                        EduFund AI
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight">
                        Grant & stipendiya assistant
                    </div>
                </div>
            </div>

            <div className="mx-4 h-px bg-slate-200 dark:bg-slate-800/80" />

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-[0.15em] px-3 mb-2">
                    Menu
                </div>
                {NAV_ITEMS.map(({ to, label, Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            [
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group",
                                isActive
                                    ? "bg-[#3D3DC4] text-white shadow-lg shadow-[#3D3DC4]/25"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100",
                            ].join(" ")
                        }
                    >
                        <Icon
                            size={18}
                            className="shrink-0 transition-transform group-hover:scale-110"
                        />
                        <span className="truncate">{label}</span>
                    </NavLink>
                ))}

                {/* Premium link */}
                <NavLink
                    to="/premium"
                    className={({ isActive }) =>
                        [
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group",
                            isActive
                                ? "bg-gradient-to-r from-[#3D3DC4] to-[#6366F1] text-white shadow-lg shadow-[#3D3DC4]/25"
                                : "text-amber-500 dark:text-amber-400/80 hover:bg-amber-50 dark:hover:bg-slate-800/70 hover:text-amber-600 dark:hover:text-amber-300",
                        ].join(" ")
                    }
                >
                    <Crown
                        size={18}
                        className="shrink-0 transition-transform group-hover:scale-110"
                    />
                    <span className="truncate">Premium</span>
                    {!user?.isPremium && (
                        <span className="ml-auto text-[9px] font-black uppercase bg-amber-400/15 text-amber-400 px-1.5 py-0.5 rounded-md border border-amber-400/20">
                            New
                        </span>
                    )}
                </NavLink>

                {/* Admin section */}
                {isAdmin && (
                    <>
                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em] px-3 mt-6 mb-2">
                            Admin
                        </div>
                        {ADMIN_ITEMS.map(({ to, label, Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    [
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group",
                                        isActive
                                            ? "bg-[#3D3DC4] text-white shadow-lg shadow-[#3D3DC4]/25"
                                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100",
                                    ].join(" ")
                                }
                            >
                                <Icon
                                    size={18}
                                    className="shrink-0 transition-transform group-hover:scale-110"
                                />
                                <span className="truncate">{label}</span>
                            </NavLink>
                        ))}
                    </>
                )}
            </nav>

            <div className="mx-4 h-px bg-slate-200 dark:bg-slate-800/80" />

            {/* ── User Card ── */}
            <div className="px-3 py-4">
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/60 transition-colors">
                    <div className="h-9 w-9 rounded-lg bg-[#3D3DC4]/15 border border-[#3D3DC4]/30 flex items-center justify-center text-[#3D3DC4] text-xs font-bold shrink-0">
                        {initials(displayName)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-bold text-slate-900 dark:text-slate-200 truncate">
                            {displayName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                            {user?.email || "—"}
                        </div>
                    </div>
                    
                    <div className="shrink-0 scale-75 origin-right">
                        <ThemeToggle />
                    </div>

                    <button
                        onClick={handleLogout}
                        title="Chiqish"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors shrink-0"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
        </aside>
    );
}
