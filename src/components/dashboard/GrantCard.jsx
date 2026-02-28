import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import { ExternalLink } from "lucide-react";
import { daysUntil } from "../../lib/utils.js";

function typeBadge(type, fundingType) {
  const t = String(type || fundingType || "").toLowerCase();
  const map = {
    conference: { label: "🏆 Conference", cls: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40" },
    research: { label: "🔬 Research", cls: "bg-teal-600/20 text-teal-300 border border-teal-500/40" },
    stajirovka: { label: "📋 Stajirovka", cls: "bg-orange-500/20 text-orange-300 border border-orange-500/40" },
    language_program: { label: "🌐 Language", cls: "bg-violet-500/20 text-violet-300 border border-violet-500/40" },
  };
  return map[t] || null;
}

export default function GrantCard({ grant, matchPercent }) {
  const navigate = useNavigate();

  const mp =
    typeof matchPercent === "number" ? matchPercent : grant?.matchPercent;
  const deadlineDays = useMemo(
    () => daysUntil(grant?.deadline),
    [grant?.deadline]
  );

  const urgent =
    typeof deadlineDays === "number" && deadlineDays >= 0 && deadlineDays < 3;

  const extraBadge = typeBadge(grant?.type, grant?.fundingType);

  return (
    <Card
      className="bg-[#1E293B] border-[#334155] rounded-2xl p-4 cursor-pointer hover:border-slate-400 transition-colors"
      onClick={() => navigate(`/grants/${grant?.id || grant?.opportunityId || ""}`)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-slate-50 font-semibold truncate">
            {grant?.title || "Grant"}
          </div>
          <div className="text-sm text-[#64748B] mt-1 truncate">
            {grant?.country || "-"} • {grant?.organization || "-"}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-[11px] font-bold border border-[#10B981]/20">
            {mp ?? 0}% Match
          </div>
          {grant?.isPriority && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
              🎯 Priority
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {extraBadge ? (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${extraBadge.cls}`}>
            {extraBadge.label}
          </span>
        ) : (
          grant?.fundingType && <Badge variant="green">{grant.fundingType}</Badge>
        )}
        {grant?.degree && (
          <Badge variant="blue">
            {Array.isArray(grant.degree) ? grant.degree.join(", ") : grant.degree}
          </Badge>
        )}
        {grant?.field && (
          <Badge variant="outline">
            {Array.isArray(grant.field) ? grant.field[0] : grant.field}
          </Badge>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="text-sm">
          {typeof deadlineDays === "number" ? (
            urgent ? (
              <span className="text-[#EF4444] font-medium">
                ⚠️ Deadline in {deadlineDays} days
              </span>
            ) : (
              <span className="text-[#64748B]">Deadline in {deadlineDays} days</span>
            )
          ) : (
            <span className="text-[#64748B]">Deadline: -</span>
          )}
        </div>

        <Button
          type="button"
          className="gap-2"
          onClick={(e) => {
            e.stopPropagation();
            if (grant?.sourceUrl) window.open(grant.sourceUrl, "_blank");
          }}
        >
          Apply Now <ExternalLink size={16} />
        </Button>
      </div>
    </Card>
  );
}
