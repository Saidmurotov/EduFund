import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { db, auth } from "../../lib/firebase.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import Card from "../ui/Card.jsx";
import { Calendar, Clock } from "lucide-react";

export default function UpcomingTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      const currentUser = auth.currentUser;
      if (!currentUser?.uid) {
        if (alive) setLoading(false);
        return;
      }
      
      let timer = setTimeout(() => {
        if (loading && alive) {
          console.warn("UpcomingTasks loading timeout");
        }
      }, 5000);

      try {
        const q = query(
          collection(db, "userCalendars", currentUser.uid, "plans"),
          where("userId", "==", currentUser.uid)
        );
        const snap = await getDocs(q);
        let allUncompleted = [];
        
        snap.forEach((doc) => {
          const plan = doc.data();
          if (Array.isArray(plan.steps)) {
            const planTasks = plan.steps
              .filter((s) => !s.completed && s.endDate)
              .map((s) => ({
                ...s,
                planId: doc.id,
                grantTitle: plan.grantTitle,
                deadlineDate: new Date(s.endDate),
              }));
            allUncompleted = [...allUncompleted, ...planTasks];
          }
        });

        // Sort by nearest deadline
        allUncompleted.sort((a, b) => a.deadlineDate - b.deadlineDate);

        if (alive) {
          // Eng yaqin 4 tasini olamiz
          setTasks(allUncompleted.slice(0, 4));
        }
      } catch (e) {
        console.error("UpcomingTasks fetch error:", e);
        if (alive) setTasks([]); // Xatolikda bo'sh array qaytaramiz
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-[1.25rem] animate-pulse">
        <div className="h-4 w-32 bg-slate-700 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-slate-700 rounded w-full"></div>
          <div className="h-12 bg-slate-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) return null;

  return (
    <Card className="bg-[#1E293B] border-[#334155] rounded-2xl p-[1.25rem]">
      <div className="flex items-center justify-between mb-[1rem]">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Calendar size={14} /> Upcoming Tasks
        </h3>
      </div>
      
      <div className="space-y-[0.75rem]">
        {tasks.map((task, i) => {
          const daysLeft = Math.ceil(
            (task.deadlineDate - new Date()) / (1000 * 60 * 60 * 24)
          );
          
          let alertColor = "text-emerald-400 bg-emerald-400/10";
          if (daysLeft < 0) alertColor = "text-rose-500 bg-rose-500/10";
          else if (daysLeft <= 3) alertColor = "text-rose-400 bg-rose-400/10";
          else if (daysLeft <= 7) alertColor = "text-orange-400 bg-orange-400/10";

          return (
            <div
              key={i}
              className="bg-[#0F172A] border border-[#334155] rounded-xl p-3 flex flex-col gap-2"
            >
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-slate-100 line-clamp-1">
                  {task.title}
                </p>
                <span
                  className={`text-[10px] whitespace-nowrap px-2 py-0.5 rounded-full font-bold ${alertColor}`}
                >
                  {daysLeft < 0
                    ? "O'tib ketgan"
                    : daysLeft === 0
                    ? "Bugun!"
                    : `${daysLeft} kun qoldi`}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1 flex items-center gap-1">
                <Clock size={10} /> {task.endDate} — {task.grantTitle}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <Link 
          to="/calendar" 
          className="text-xs text-[#3D3DC4] font-medium hover:underline"
        >
          Barcha rejalarni ko'rish
        </Link>
      </div>
    </Card>
  );
}
