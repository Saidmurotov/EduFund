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
    <div className="mt-[0.5rem] space-y-[1.5rem]">
      {/* Priority Section */}
      {priority.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-[0.75rem]">
            <h3 className="text-lg font-bold text-slate-50 flex items-center gap-[0.5rem]">
              🌍 Your Target Countries
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-[0.5rem] py-[0.125rem] rounded-full font-medium">
                {priority.length} ta
              </span>
            </h3>
          </div>
          <div className="flex flex-wrap gap-[0.75rem]">
            {priority.map((g) => (
              <div key={g.id || g.opportunityId} className="w-full xl:w-[calc(50%-0.375rem)]">
                <GrantCard
                  grant={g}
                  matchPercent={g.matchPercent}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Matches Section */}
      <div>
        <div className="flex items-center justify-between mb-[0.75rem]">
          <h3 className="text-lg font-bold text-slate-50">
            {priority.length > 0 ? "More Matches For You" : "Best Matches For You"}
          </h3>
          <Link to="/search" className="text-sm text-[#3D3DC4] hover:underline font-medium">
            View all
          </Link>
        </div>
        <div className="flex flex-wrap gap-[0.75rem]">
          {others.map((g) => (
            <div key={g.id || g.opportunityId} className="w-full xl:w-[calc(50%-0.375rem)]">
              <GrantCard
                grant={g}
                matchPercent={g.matchPercent}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
