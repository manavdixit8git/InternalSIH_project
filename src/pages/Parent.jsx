import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RotateCcw, TrendingUp, CheckCircle2, Target } from "lucide-react";
import { useGame } from "../context/GameContext";
import { progressService } from "../services/progressService";
import { scenarioService } from "../services/scenarioService";
import GameNav from "../components/ui/GameNav";

const CATEGORIES = ["Environment", "Safety", "Kindness", "Social Skills", "Responsibility"];
const COLORS = {
  Environment: "#22c55e",
  Safety: "#f97316",
  Kindness: "#ec4899",
  "Social Skills": "#a855f7",
  Responsibility: "#38bdf8",
};

export default function Parent() {
  const navigate = useNavigate();
  const { player, progress, resetProgress, playSound } = useGame();
  const completed = progressService.completedCount();
  const total = scenarioService.getAll().length;

  // Positive choices count
  const totalPositive = Object.values(progress.categoryStats).reduce((a, s) => a + (s.positive || 0), 0);
  const totalAttempts = Object.values(progress.categoryStats).reduce((a, s) => a + (s.total || 0), 0);

  const needsPractice = CATEGORIES.filter((c) => {
    const s = progress.categoryStats[c];
    return s && s.total > 0 && progressService.categoryPercent(c) < 60;
  });

  const explored = CATEGORIES.filter((c) => progress.categoryStats[c]?.total > 0);

  return (
    <div className="min-h-screen">
      <GameNav />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-5 rounded-3xl bg-white/95 p-5 shadow-xl sm:p-7">
          <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            <TrendingUp size={14} /> PARENT & TEACHER VIEW
          </div>
          <h1 className="font-fun text-3xl font-extrabold text-slate-800">
            {player?.name || "Explorer"}'s Learning Report
          </h1>
          <p className="text-slate-500">A calm overview of skills explored through play.</p>

          {/* summary tiles */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryTile icon={CheckCircle2} color="#22c55e" value={`${completed}/${total}`} label="Scenarios done" />
            <SummaryTile icon={Target} color="#7c5cff" value={totalPositive} label="Positive choices" />
            <SummaryTile icon={TrendingUp} color="#f59e0b" value={`${totalAttempts}`} label="Total attempts" />
            <SummaryTile icon={CheckCircle2} color="#ec4899" value={progress.badges.length} label="Badges earned" />
          </div>
        </div>

        {/* Category progress */}
        <div className="mb-5 rounded-3xl bg-white/95 p-5 shadow-xl sm:p-7">
          <h2 className="font-fun mb-4 text-xl font-extrabold text-slate-800">Skill Areas</h2>
          <div className="space-y-4">
            {CATEGORIES.map((c) => {
              const pct = progressService.categoryPercent(c);
              const attempts = progress.categoryStats[c]?.total || 0;
              return (
                <div key={c}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-fun font-bold text-slate-700">{c}</span>
                    <span className="font-bold text-slate-400">
                      {attempts > 0 ? `${pct}%` : "Not explored yet"}
                    </span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: COLORS[c] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-emerald-50 p-5 shadow-lg">
            <h3 className="font-fun mb-2 text-lg font-extrabold text-emerald-700">🌟 Strengths</h3>
            {explored.length === 0 ? (
              <p className="text-slate-500">Play a few scenarios to see strengths here.</p>
            ) : (
              <ul className="space-y-1 text-slate-600">
                {explored
                  .filter((c) => progressService.categoryPercent(c) >= 60)
                  .map((c) => <li key={c}>✓ Great choices in <b>{c}</b></li>)}
                {explored.filter((c) => progressService.categoryPercent(c) >= 60).length === 0 && (
                  <li>Keep exploring — strengths are growing!</li>
                )}
              </ul>
            )}
          </div>
          <div className="rounded-3xl bg-amber-50 p-5 shadow-lg">
            <h3 className="font-fun mb-2 text-lg font-extrabold text-amber-700">💡 More Practice</h3>
            {needsPractice.length === 0 ? (
              <p className="text-slate-500">Nothing needs extra practice right now. 🎉</p>
            ) : (
              <ul className="space-y-1 text-slate-600">
                {needsPractice.map((c) => <li key={c}>• Revisit <b>{c}</b> scenarios together</li>)}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              playSound("click");
              if (confirm("Reset all progress and world state? This cannot be undone.")) {
                resetProgress();
              }
            }}
            className="font-fun flex items-center gap-2 rounded-2xl bg-slate-200 px-6 py-3 font-bold text-slate-600 hover:bg-slate-300"
          >
            <RotateCcw size={18} /> Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryTile({ icon: Icon, color, value, label }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: color }}>
        <Icon size={20} />
      </div>
      <p className="font-fun text-xl font-extrabold text-slate-800">{value}</p>
      <p className="text-[11px] font-bold text-slate-500">{label}</p>
    </div>
  );
}
