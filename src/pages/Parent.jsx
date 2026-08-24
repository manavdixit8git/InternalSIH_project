import { motion } from "framer-motion";
import { RotateCcw, TrendingUp, CheckCircle2, Target } from "lucide-react";
import { useGame } from "../context/GameContext";
import { progressService } from "../services/progressService";
import { scenarioService } from "../services/scenarioService";
import GameNav from "../components/ui/GameNav";

const CATEGORIES = ["Environment", "Safety", "Kindness", "Social Skills", "Responsibility"];
const COLORS = { Environment: "#22c55e", Safety: "#f97316", Kindness: "#ec4899", "Social Skills": "#a855f7", Responsibility: "#38bdf8" };

export default function Parent() {
  const { player, progress, resetProgress, playSound, lang } = useGame();
  const completed = progressService.completedCount();
  const total = scenarioService.getAll().length;
  const totalPositive = Object.values(progress.categoryStats).reduce((a, s) => a + (s.positive || 0), 0);
  const totalAttempts = Object.values(progress.categoryStats).reduce((a, s) => a + (s.total || 0), 0);

  return (
    <div className="min-h-screen">
      <GameNav />
      <div className="mx-auto max-w-4xl px-3 py-4">
        <div className="mb-4 rounded-3xl bg-white/95 p-4 shadow-xl sm:p-5">
          <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
            <TrendingUp size={12} /> {lang === "hi" ? "बड़ों के लिए" : "PARENT & TEACHER VIEW"}
          </div>
          <h1 className="font-fun text-xl font-extrabold text-slate-800">
            {player?.name || "Explorer"} {lang === "hi" ? "की रिपोर्ट" : "'s Report"}
          </h1>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <SummaryTile icon={CheckCircle2} color="#22c55e" value={`${completed}/${total}`} label={lang === "hi" ? "पूरे" : "Done"} />
            <SummaryTile icon={Target} color="#7c5cff" value={totalPositive} label={lang === "hi" ? "अच्छे" : "Good"} />
            <SummaryTile icon={TrendingUp} color="#f59e0b" value={`${totalAttempts}`} label={lang === "hi" ? "कोशिश" : "Tries"} />
            <SummaryTile icon={CheckCircle2} color="#ec4899" value={progress.badges.length} label="Badges" />
          </div>
        </div>

        <div className="mb-4 rounded-3xl bg-white/95 p-4 shadow-xl">
          <h2 className="font-fun mb-3 text-lg font-extrabold text-slate-800">{lang === "hi" ? "कौशल" : "Skills"}</h2>
          <div className="space-y-3">
            {CATEGORIES.map((c) => {
              const pct = progressService.categoryPercent(c);
              const attempts = progress.categoryStats[c]?.total || 0;
              return (
                <div key={c}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-fun font-bold text-slate-700">{c}</span>
                    <span className="font-bold text-slate-400">{attempts > 0 ? `${pct}%` : "-"}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <motion.div className="h-full rounded-full" style={{ background: COLORS[c] }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center">
          <button onClick={() => { playSound("click"); if (confirm(lang === "hi" ? "सब रीसेट करें?" : "Reset all progress?")) resetProgress(); }} className="font-fun flex items-center gap-2 rounded-2xl bg-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-300">
            <RotateCcw size={16} /> {lang === "hi" ? "रीसेट" : "Reset"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryTile({ icon: Icon, color, value, label }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-2.5 text-center">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl text-white" style={{ background: color }}>
        <Icon size={16} />
      </div>
      <p className="font-fun text-lg font-extrabold leading-none text-slate-800">{value}</p>
      <p className="text-[10px] font-bold text-slate-500">{label}</p>
    </div>
  );
}
