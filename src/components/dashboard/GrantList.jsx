import GrantCard from "./GrantCard.jsx";

export default function GrantList({ grants }) {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-50">
          Best Matches For You
        </h3>
        <a href="/search" className="text-sm text-[#2563EB] hover:underline">
          View all
        </a>
      </div>

      <div className="mt-3 space-y-3">
        {(grants || []).map((g) => (
          <GrantCard
            key={g.id || g.opportunityId}
            grant={g}
            matchPercent={g.matchPercent}
          />
        ))}
      </div>
    </div>
  );
}

