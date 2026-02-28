import { useEffect, useState } from "react";
import {
  Book,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  Route,
} from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { api, withAuth } from "../lib/api.js";
import { db } from "../lib/firebase.js";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

function iconFor(name) {
  const n = String(name || "").toLowerCase();
  if (n === "book") return Book;
  if (n === "calendar") return Calendar;
  if (n === "file" || n === "filetext" || n === "file-text") return FileText;
  if (n === "check" || n === "checkcircle" || n === "check-circle")
    return CheckCircle2;
  return Route;
}

export default function Roadmap() {
  const { user, getIdToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [grantTitle, setGrantTitle] = useState("your grant");

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!user?.uid) return;
      setLoading(true);
      setError("");

      let targetGrant = {
        title: "DAAD Research Scholarship",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90)
          .toISOString()
          .slice(0, 10),
        requirements: {},
      };

      try {
        if (db) {
          const q = query(
            collection(db, "savedGrants", user.uid, "items"),
            orderBy("savedAt", "desc"),
            limit(1)
          );
          const snap = await getDocs(q);
          const first = snap.docs[0]?.data();
          if (first?.grantData?.title) {
            targetGrant = {
              title: first.grantData.title,
              deadline: first.grantData.deadline || targetGrant.deadline,
              requirements: first.grantData.requirements || {},
            };
          }
        }

        setGrantTitle(targetGrant.title || "your grant");

        const headers = await withAuth(getIdToken);
        const res = await api.post(
          "/ai/roadmap",
          { userId: user.uid, targetGrant },
          { headers }
        );
        if (!alive) return;
        setData(res.data);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError("Roadmapni yuklashda xato yuz berdi.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [user?.uid, getIdToken]);

  const steps = Array.isArray(data?.steps) ? data.steps : [];
  const total = steps.length || 1;
  const currentStep = 1;
  const percent = Math.round((currentStep / total) * 100);

  if (loading) {
    return (
      <div className="py-8">
        <div className="text-slate-50 font-semibold">Roadmap tayyorlanmoqda...</div>
        <div className="mt-3 h-10 w-10 rounded-full border-4 border-[#334155] border-t-[#2563EB] animate-spin" />
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

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Route className="text-[#2563EB]" size={20} />
            <div className="text-xl font-semibold text-slate-50">
              Your Roadmap to {grantTitle}
            </div>
          </div>
          <div className="text-sm text-[#64748B] mt-1">
            {data?.totalMonths ? `${data.totalMonths}-month preparation plan` : "Preparation plan"}
          </div>
        </div>
      </div>

      <Card className="bg-[#1E293B] border-[#334155] rounded-2xl">
        <div className="text-sm text-slate-200">
          Step {currentStep} of {total} —{" "}
          <span className="text-slate-50 font-semibold">{percent}%</span> complete
        </div>
        <div className="mt-3 h-2 rounded-full bg-[#0F172A] border border-[#334155] overflow-hidden">
          <div className="h-full bg-[#2563EB]" style={{ width: `${percent}%` }} />
        </div>
      </Card>

      <div className="space-y-4">
        {steps.map((s, idx) => {
          const Icon = iconFor(s.icon);
          const inProgress = s.status === "in_progress";
          return (
            <div key={idx} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={[
                    "h-10 w-10 rounded-full flex items-center justify-center border",
                    inProgress
                      ? "bg-[#2563EB]/15 border-[#2563EB]/40 text-[#2563EB]"
                      : "bg-[#1E293B] border-[#334155] text-[#64748B]",
                  ].join(" ")}
                >
                  <Icon size={18} />
                </div>
                {idx < steps.length - 1 && <div className="w-px flex-1 bg-[#334155] my-2" />}
              </div>

              <Card
                className={[
                  "flex-1 bg-[#1E293B] border-[#334155] rounded-2xl",
                  inProgress ? "border-l-4 border-l-[#2563EB] bg-[#2563EB]/5" : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-[#64748B]">
                    MONTH {s.month || idx + 1}
                  </div>
                  <span
                    className={[
                      "text-xs font-semibold px-2.5 py-1 rounded-full border",
                      inProgress
                        ? "bg-[#2563EB]/15 text-[#2563EB] border-[#2563EB]/30"
                        : "bg-[#0F172A] text-[#64748B] border-[#334155]",
                    ].join(" ")}
                  >
                    {inProgress ? "in_progress" : "upcoming"}
                  </span>
                </div>
                <div className="text-slate-50 font-semibold mt-2">{s.title || "Step"}</div>
                <div className="text-sm text-slate-200 mt-1">{s.description || "-"}</div>
              </Card>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={!steps.length}
        onClick={() => {
          const lines = [
            `# Roadmap: ${grantTitle}`,
            data?.totalMonths ? `Tayyorgarlik rejasi: ${data.totalMonths} oy` : "",
            data?.summary || "",
            "",
            ...steps.map(
              (s, i) =>
                `## ${i + 1}. ${s.title || "Step"} (Month ${s.month || i + 1})\n${s.description || "-"}\nStatus: ${s.status || "upcoming"}\n`
            ),
          ];
          const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `roadmap-${grantTitle.replace(/\s+/g, "_")}.txt`;
          a.click();
          URL.revokeObjectURL(url);
        }}
      >
        <Download size={16} /> Roadmapni yuklab olish
      </Button>
    </div>
  );
}

