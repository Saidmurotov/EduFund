import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import { ExternalLink } from "lucide-react";

function daysUntil(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return null;
  const ms = d.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
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
        <div className="text-sm font-semibold text-[#10B981] whitespace-nowrap">
          {mp ?? 0}% match
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {grant?.fundingType && <Badge variant="green">{grant.fundingType}</Badge>}
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

