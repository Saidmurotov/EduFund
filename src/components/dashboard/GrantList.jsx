import { useMemo } from "react";
import { Link } from "react-router-dom";
import GrantCard from "./GrantCard.jsx";

export default function GrantList({ grants }) {
  const gList = useMemo(() => grants || [], [grants]);
  const targetCountryMatches = useMemo(() => gList.filter((g) => g.isPriority), [gList]);
  const otherMatches = useMemo(() => gList.filter((g) => !g.isPriority), [gList]);

  if (!gList.length) {
    return (
      <div className="text-center py-10 bg-[#1E293B] border border-[#334155] rounded-2xl">
        <p className="text-slate-400">Profilingizga mos grantlar topilmadi.</p>
      </div>
    );
  }

  return (
    <div className="mt-[0.5rem] space-y-[1.5rem]">
      {targetCountryMatches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-[0.75rem]">
            <h3 className="text-lg font-bold text-slate-50 flex items-center gap-[0.5rem]">
              Maqsad davlatlaringizga mos
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-[0.5rem] py-[0.125rem] rounded-full font-medium">
                {targetCountryMatches.length} ta
              </span>
            </h3>
          </div>
          <div className="flex flex-wrap gap-[0.75rem]">
            {targetCountryMatches.map((g) => (
              <div key={g.id || g.opportunityId} className="w-full xl:w-[calc(50%-0.375rem)]">
                <GrantCard grant={g} matchPercent={g.matchPercent} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-[0.75rem]">
          <h3 className="text-lg font-bold text-slate-50">
            {targetCountryMatches.length > 0 ? "Boshqa mos grantlar" : "Sizga eng mos grantlar"}
          </h3>
          <Link to="/search" className="text-sm text-[#3D3DC4] hover:underline font-medium">
            Barchasini ko'rish
          </Link>
        </div>
        <div className="flex flex-wrap gap-[0.75rem]">
          {otherMatches.map((g) => (
            <div key={g.id || g.opportunityId} className="w-full xl:w-[calc(50%-0.375rem)]">
              <GrantCard grant={g} matchPercent={g.matchPercent} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
