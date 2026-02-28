import { useState, useRef, useEffect } from "react";
import { Bell, X, Calendar, MapPin, Check } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext.jsx";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        function clickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", clickOutside);
        return () => document.removeEventListener("mousedown", clickOutside);
    }, []);

    const handleNotifClick = async (notif) => {
        if (!notif.isRead) await markAsRead(notif.id);
        setIsOpen(false);
        if (notif.grantId) {
            if (notif.type === 'deadline_reminder') {
                navigate('/calendar');
            } else {
                navigate(`/grants/${notif.grantId}`);
            }
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={[
                    "h-10 w-10 rounded-full flex items-center justify-center transition-colors relative",
                    isOpen ? "bg-[#3D3DC4]/10 text-[#3D3DC4]" : "bg-[#1E293B] text-slate-400 hover:text-white"
                ].join(" ")}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-4 w-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#1E293B]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-12 right-0 w-80 max-h-96 bg-[#1E293B] border border-[#334155] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-[#334155] flex items-center justify-between bg-[#1E293B] sticky top-0">
                        <h3 className="text-sm font-bold text-slate-50">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] font-bold uppercase text-[#3D3DC4] hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-[100px]">
                        {!notifications.length ? (
                            <div className="p-8 text-center bg-[#1E293B]">
                                <div className="h-10 w-10 bg-[#0F172A] rounded-full flex items-center justify-center mx-auto mb-2 text-slate-500">
                                    <Bell size={18} />
                                </div>
                                <p className="text-sm text-slate-400">Hozircha hech narsa yo'q</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#334155]/30">
                                {notifications.map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => handleNotifClick(n)}
                                        className={[
                                            "w-full p-4 text-left hover:bg-white/5 transition-colors flex gap-3 items-start",
                                            !n.isRead ? "bg-[#3D3DC4]/5" : ""
                                        ].join(" ")}
                                    >
                                        <div className={[
                                            "h-8 w-8 rounded-lg shrink-0 flex items-center justify-center",
                                            n.type === 'grant_deadline' ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                                        ].join(" ")}>
                                            {n.type === 'grant_deadline' ? <Calendar size={16} /> : <X size={16} />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-slate-50">{n.title}</div>
                                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[9px] text-slate-500 font-medium">
                                                    {n.createdAt && new Date(n.createdAt.toDate?.() || n.createdAt).toLocaleDateString()}
                                                </span>
                                                {!n.isRead && <div className="h-1.5 w-1.5 rounded-full bg-[#3D3DC4]" />}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 bg-[#0F172A]/50 border-t border-[#334155]">
                        <button
                            onClick={() => { setIsOpen(false); navigate('/profile'); }}
                            className="w-full py-2 text-[10px] font-bold uppercase text-slate-500 hover:text-slate-300"
                        >
                            View settings
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
