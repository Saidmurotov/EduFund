import { useEffect, useState } from "react";
import { api, withAuth } from "../lib/api.js";
import { useAuth } from "../hooks/useAuth.js";
import Card from "../components/ui/Card.jsx";
import {
    Users, UserCheck, GraduationCap, MapPin,
    BarChart3, PieChart as PieChartIcon, TrendingUp
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const COLORS = ["#3D3DC4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function AdminStats() {
    const { user, getIdToken } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const headers = await withAuth(getIdToken);
                const res = await api.get("/admin/stats", { headers });
                setStats(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [getIdToken]);

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="h-10 w-10 rounded-full border-4 border-slate-700 border-t-[#3D3DC4] animate-spin" />
                <p className="text-slate-400">Statistikani yuklamoqda...</p>
            </div>
        );
    }

    if (!stats) return <div className="p-10 text-center text-slate-400">Ruxsat yo'q yoki xato.</div>;

    const pieData = [
        { name: "Erkakлар", value: stats.male },
        { name: "Ayollar", value: stats.female },
    ];

    const categoryData = Object.entries(stats.byCategory || {}).map(([name, value]) => ({ name, value }));
    const regionData = Object.entries(stats.byRegion || {})
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }));

    return (
        <div className="py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-50">Admin Statistika</h1>
                    <p className="text-sm text-slate-400 mt-1">Platforma faolligi va foydalanuvchilar qamrovi</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-[#3D3DC4]/10 border border-[#3D3DC4]/30 text-[#3D3DC4] font-bold text-sm">
                    ADMIN PANEL
                </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard title="Jami foydalanuvchi" value={stats.totalUsers} Icon={Users} />
                <StatCard title="40 yoshgacha" value={stats.under40} Icon={UserCheck} />
                <StatCard title="Master/PhD" value={stats.highDegree} Icon={GraduationCap} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gender Breakdown */}
                <Card className="bg-[#1E293B] border-[#334155] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-50 mb-6 flex items-center gap-2">
                        <PieChartIcon size={20} className="text-[#3D3DC4]" /> Gender Breakdown
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Growth Trend */}
                <Card className="bg-[#1E293B] border-[#334155] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-50 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-[#10B981]" /> Oylik o'sish
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.monthlyGrowth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="users" stroke="#3D3DC4" strokeWidth={3} dot={{ r: 4, fill: '#3D3DC4' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Regions List */}
                <Card className="bg-[#1E293B] border-[#334155] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-50 mb-6 flex items-center gap-2">
                        <MapPin size={20} className="text-rose-500" /> Hududlar bo'yicha
                    </h3>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {regionData.map(({ name, value }) => {
                            const percent = (value / stats.totalUsers) * 100;
                            return (
                                <div key={name} className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-300 font-medium">{name}</span>
                                        <span className="text-slate-500">{value} ta</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-[#0F172A] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#3D3DC4] transition-all" style={{ width: `${percent}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Categories Bar Chart */}
                <Card className="bg-[#1E293B] border-[#334155] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-50 mb-6 flex items-center gap-2">
                        <BarChart3 size={20} className="text-emerald-500" /> Grant Kategoriyalari
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} width={80} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
        </div>
    );
}

function StatCard({ title, value, Icon }) {
    return (
        <Card className="bg-[#1E293B] border-[#334155] rounded-2xl p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#3D3DC4]/10 text-[#3D3DC4] flex items-center justify-center shrink-0">
                <Icon size={20} />
            </div>
            <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{title}</div>
                <div className="text-xl font-bold text-slate-50">{value}</div>
            </div>
        </Card>
    );
}
