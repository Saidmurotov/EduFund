import { Link } from "react-router-dom";
import GrantCard from "./GrantCard.jsx";
import { useMemo } from "react";

export default function GrantList({ grants }) {
  const gList = grants || [];

  const priority = useMemo(() => gList.filter((g) => g.isPriority), [gList]);
  const others = useMemo(() => gList.filter((g) => !g.isPriority), [gList]);

  if (!gList.length) {
    return (
      <div className="text-center py-10 bg-[#1E293B] border border-[#334155] rounded-2xl">
        <p className="text-slate-400">Sizga mos grantlar topilmadi.</p>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-6">
      {/* Priority Section */}
      {priority.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-50 flex items-center gap-2">
              🌍 Your Target Countries
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                {priority.length} ta
              </span>
            </h3>
          </div>
          <div className="space-y-3">
            {priority.map((g) => (
              <GrantCard
                key={g.id || g.opportunityId}
                grant={g}
                matchPercent={g.matchPercent}
              />
            ))}
          </div>
        </div>
      )}

      {/* General Matches Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-50">
            {priority.length > 0 ? "More Matches For You" : "Best Matches For You"}
          </h3>
          <Link to="/search" className="text-sm text-[#3D3DC4] hover:underline font-medium">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {others.map((g) => (
            <GrantCard
              key={g.id || g.opportunityId}
              grant={g}
              matchPercent={g.matchPercent}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
