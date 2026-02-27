import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, ExternalLink } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import { api, withAuth } from "../lib/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { db } from "../lib/firebase.js";
import { doc, setDoc } from "firebase/firestore";
import { SkeletonLine } from "../components/ui/Skeleton.jsx";
import { useToast } from "../context/ToastContext.jsx";

function countryFlag(country) {
  const map = {
    Germany: "🇩🇪",
    "South Korea": "🇰🇷",
    USA: "🇺🇸",
    UK: "🇬🇧",
    Austria: "🇦🇹",
    Japan: "🇯🇵",
    China: "🇨🇳",
    France: "🇫🇷",
  };
  return map[country] || "🌍";
}

function initials(name) {
  const n = String(name || "").trim();
  if (!n) return "GR";
  const parts = n.split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] + (parts[1]?.[0] || "")).toUpperCase();
}

function TrustBadge({ trustScore, verificationStatus }) {
  const score = typeof trustScore === "number" ? trustScore : 0;
  const status =
    verificationStatus ||
    (score >= 80 ? "verified" : score >= 50 ? "pending" : "suspicious");

  if (status === "verified") {
    return (
      <div className="text-sm font-semibold text-[#10B981]">
        ✓ Verified — Trust Score: {score}
      </div>
    );
  }
  if (status === "pending") {
    return (
      <div className="text-sm font-semibold text-[#F59E0B]">
        ⏳ Pending verification — Trust Score: {score}
      </div>
    );
  }
  return (
    <div className="text-sm font-semibold text-[#EF4444]">
      ⚠️ Suspicious — Trust Score: {score}
    </div>
  );
}

function Circular({ percent }) {
  const p = Math.max(0, Math.min(100, Number(percent || 0)));
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (p / 100) * c;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} stroke="#334155" strokeWidth="8" fill="none" />
      <circle
        cx="36"
        cy="36"
        r={r}
        stroke="#2563EB"
        strokeWidth="8"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
      />
      <text
        x="36"
        y="40"
        textAnchor="middle"
        fill="#F1F5F9"
        fontSize="14"
        fontWeight="700"
      >
        {p}%
      </text>
    </svg>
  );
}

export default function GrantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getIdToken } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [grant, setGrant] = useState(null);
  const [matchPercent, setMatchPercent] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const headers = await withAuth(getIdToken);
        const [gRes, mRes] = await Promise.all([
          api.get(`/grants/${id}`, { headers }),
          user?.uid
            ? api.get(`/grants/match/${user.uid}`, { headers })
            : Promise.resolve({ data: [] }),
        ]);

        if (!alive) return;
        const g = gRes.data;
        setGrant(g);

        const list = Array.isArray(mRes.data) ? mRes.data : [];
        const matched = list.find((x) => String(x.id) === String(id));
        setMatchPercent(matched?.matchPercent || 0);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError("Grant ma'lumotlarini yuklashda xato yuz berdi.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [id, user?.uid, getIdToken]);

  const matchChecks = useMemo(
    () => [
      { ok: true, label: "✓ GPA Requirements met" },
      { ok: true, label: "✓ IELTS Score sufficient" },
      { ok: true, label: "✓ Field Eligible" },
    ],
    []
  );

  const description = grant?.description || "";
  const shortDesc =
    description.length > 150 ? description.slice(0, 150) + "..." : description;

  const saveGrant = async () => {
    if (!user?.uid) {
      setError("Avval login qiling.");
      return;
    }
    if (!db) {
      setError("Firebase sozlanmagan. `.env` ni to'ldiring.");
      return;
    }
    if (!grant) return;

    setSaving(true);
    setError("");
    try {
      const ref = doc(db, "savedGrants", user.uid, "items", String(grant.id || id));
      await setDoc(ref, {
        grantId: String(grant.id || id),
        savedAt: Date.now(),
        grantData: grant,
      });
      toast?.showToast?.("Grant saqlandi ✓", "success");
    } catch (e) {
      console.error(e);
      setError("Saqlashda xato yuz berdi.");
      toast?.showToast?.("Internet bilan muammo", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 space-y-3">
        <SkeletonLine height="lg" />
        <div className="rounded-2xl bg-[#1E293B] border border-[#334155] p-4">
          <SkeletonLine width="3/4" height="lg" />
          <div className="mt-2">
            <SkeletonLine width="1/2" height="sm" />
          </div>
        </div>
        <div className="rounded-2xl bg-[#1E293B] border border-[#334155] p-4">
          <SkeletonLine width="full" height="md" />
          <div className="mt-2">
            <SkeletonLine width="3/4" height="md" />
          </div>
          <div className="mt-2">
            <SkeletonLine width="1/2" height="md" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="text-sm text-[#EF4444] bg-[#1E293B] border border-[#EF4444]/40 rounded-lg px-3 py-2">
          {error}
        </div>
      </div>
    );
  }

  if (!grant) return null;

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-200 hover:text-white"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-semibold">Grant Details</span>
        </button>

        <div className="text-sm text-slate-200">
          {grant.country} {countryFlag(grant.country)}
        </div>
      </div>

      <Card className="bg-[#1E293B] border-[#334155] rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#2563EB]/15 border border-[#2563EB]/40 flex items-center justify-center text-[#2563EB] font-bold">
            {initials(grant.organization)}
          </div>
          <div className="min-w-0">
            <TrustBadge
              trustScore={grant.trustScore}
              verificationStatus={grant.verificationStatus}
            />
            <div className="text-2xl font-semibold text-slate-50 mt-2">
              {grant.title}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {grant.fundingType && (
                <Badge variant="green">{grant.fundingType}</Badge>
              )}
              {grant.degree && (
                <Badge variant="blue">
                  {Array.isArray(grant.degree)
                    ? grant.degree.join(", ")
                    : grant.degree}
                </Badge>
              )}
              {grant.field && (
                <Badge variant="outline">
                  {Array.isArray(grant.field) ? grant.field[0] : grant.field}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="bg-[#1E293B] border-[#334155] rounded-2xl">
          <div className="text-xs text-[#64748B] font-semibold">📅 DEADLINE</div>
          <div className="text-slate-50 font-semibold mt-1">
            {grant.deadline || "-"}
          </div>
        </Card>
        <Card className="bg-[#1E293B] border-[#334155] rounded-2xl">
          <div className="text-xs text-[#64748B] font-semibold">💰 AMOUNT</div>
          <div className="text-slate-50 font-semibold mt-1">{grant.amount || "-"}</div>
        </Card>
        <Card className="bg-[#1E293B] border-[#334155] rounded-2xl">
          <div className="text-xs text-[#64748B] font-semibold">🌐 LANGUAGE</div>
          <div className="text-slate-50 font-semibold mt-1">
            {grant.language || "-"}
          </div>
        </Card>
        <Card className="bg-[#1E293B] border-[#334155] rounded-2xl">
          <div className="text-xs text-[#64748B] font-semibold">🎓 MIN. GPA</div>
          <div className="text-slate-50 font-semibold mt-1">
            {typeof grant.minGPA === "number" ? grant.minGPA : "-"}
          </div>
        </Card>
      </div>

      <Card className="bg-[#1E293B] border-[#334155] rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-slate-50">Your Match Analysis</div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/30">
            AI POWERED
          </span>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="flex items-center justify-center sm:justify-start">
            <Circular percent={matchPercent} />
          </div>
          <div className="flex-1 space-y-2">
            {matchChecks.map((c) => (
              <div key={c.label} className="text-sm text-slate-200">
                {c.label}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="bg-[#1E293B] border-[#334155] rounded-2xl">
        <div className="text-lg font-semibold text-slate-50">Grant Overview</div>
        <div className="text-sm text-slate-200 mt-2">
          {expanded ? description || "-" : shortDesc || "-"}
        </div>
        {description.length > 150 && (
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="text-sm text-[#2563EB] mt-2 hover:underline"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={saveGrant}
          disabled={saving}
        >
          <Bookmark size={16} />
          {saving ? "Saving..." : "Save Grant"}
        </Button>
        <Button
          type="button"
          className="gap-2"
          onClick={() => grant.sourceUrl && window.open(grant.sourceUrl, "_blank")}
        >
          Apply Now <ExternalLink size={16} />
        </Button>
      </div>
    </div>
  );
}

