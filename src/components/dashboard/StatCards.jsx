import Card from "../ui/Card.jsx";
import { Bookmark, Calendar } from "lucide-react";

function StatCard({ title, value, Icon }) {
  return (
    <Card className="bg-[#1E293B] border-[#334155] rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-[#64748B] font-semibold tracking-wide">
            {title}
          </div>
          <div className="text-lg font-semibold text-slate-50 mt-1">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-xl bg-[#0F172A] border border-[#334155] flex items-center justify-center text-slate-200">
          <Icon size={18} />
        </div>
      </div>
    </Card>
  );
}

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <StatCard title="SAVED" value="4 grants" Icon={Bookmark} />
      <StatCard title="DEADLINES" value="2 this week" Icon={Calendar} />
    </div>
  );
}

