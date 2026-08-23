import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Zap, Map as MapIcon, Award } from "lucide-react";
import { useGame } from "../context/GameContext";
import { progressService } from "../services/progressService";
import { scenarioService } from "../services/scenarioService";
import GameNav from "../components/ui/GameNav";
import { PlayerAvatar } from "../components/ui/Kit";
import characters from "../data/characters.json";
import badgesData from "../data/badges.json";

const CATEGORIES = [
  { name: "Environment", emoji: "🌱", color: "#22c55e" },
  { name: "Kindness", emoji: "❤️", color: "#ec4899" },
  { name: "Safety", emoji: "🛡️", color: "#f97316" },
  { name: "Social Skills", emoji: "🤝", color: "#a855f7" },
  { name: "Responsibility", emoji: "💧", color: "#38bdf8" },
];

export default function Progress() {
  const navigate = useNavigate();
  const { player, progress, playSound, say, speak, softStopSpeaking, speaking } = useGame();
  const avatar = characters.find((c) => c.id === player?.avatar) || characters[0];
  const total = scenarioService.getAll().length;
  const completed = progressService.completedCount();
  const level = Math.floor(progress.xp / 100) + 1;

  useEffect(() => {
    const t = setTimeout(
      () =>
        say([
          `This is your journey, ${player?.name || "Explorer"}!`,
          `You are level ${level}, with ${progress.xp} experience points.`,
          `You finished ${completed} out of ${total} adventures. Keep going!`,
        ]),
      600
    );
    return () => {
      clearTimeout(t);
      softStopSpeaking(2400);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    { icon: Zap, label: "Total XP", value: progress.xp, color: "#f59e0b" },
    { icon: Star, label: "Stars", value: progress.stars, color: "#eab308" },
    { icon: MapIcon, label: "Adventures", value: `${completed}/${total}`, color: "#22c55e" },
    { icon: Award, label: "Badges", value: progress.badges.length, color: "#7c5cff" },
  ];

  return (
    <div className="min-h-screen">
      <GameNav />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="font-fun mb-5 text-center text-4xl font-extrabold text-white drop-shadow sm:text-5xl">
          My Journey ✨
        </h1>

        {/* Player card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="mb-5 flex items-center gap-4 rounded-3xl bg-white/95 p-5 shadow-xl"
        >
          <div className="anim-bob">
            <PlayerAvatar emoji={avatar.emoji} color={avatar.color} size={80} talking={speaking} />
          </div>
          <div className="flex-1">
            <p className="font-fun text-2xl font-extrabold text-slate-800">{player?.name || "Explorer"}</p>
            <p className="font-fun font-bold text-purple-600">Level {level} Explorer</p>
            <div className="mt-2 h-4 w-full overflow-hidden rounded-full bg-slate-200">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-amber-500"
                initial={{ width: 0 }} animate={{ width: `${progress.xp % 100}%` }} transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl bg-white/95 p-4 text-center shadow-lg"
            >
              <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ background: s.color }}>
                <s.icon size={24} />
              </div>
              <p className="font-fun text-2xl font-extrabold text-slate-800">{s.value}</p>
              <p className="text-xs font-bold text-slate-500">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Categories */}
        <h2 className="font-fun mb-3 text-2xl font-extrabold text-white drop-shadow">My Skills</h2>
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {CATEGORIES.map((c, i) => {
            const pct = progressService.categoryPercent(c.name);
            return (
              <motion.div
                key={c.name}
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 rounded-2xl bg-white/95 p-4 shadow-lg"
              >
                <span className="text-3xl">{c.emoji}</span>
                <div className="flex-1">
                  <div className="mb-1 flex justify-between">
                    <span className="font-fun font-bold text-slate-700">{c.name}</span>
                    <span className="font-fun font-extrabold" style={{ color: c.color }}>{pct}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                    <motion.div className="h-full rounded-full" style={{ background: c.color }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Badge preview */}
        <h2 className="font-fun mb-3 text-2xl font-extrabold text-white drop-shadow">My Badges</h2>
        <div className="flex flex-wrap gap-3">
          {badgesData.map((b) => {
            const owned = progress.badges.includes(b.id);
            return (
              <button
                key={b.id}
                onClick={() => {
                  playSound(owned ? "badge" : "lock");
                  speak(owned ? `${b.name}. ${b.description}` : `${b.name}. Keep playing to unlock this badge!`);
                }}
                className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow transition hover:scale-110 ${owned ? "" : "opacity-30 grayscale"}`}
                style={{ background: owned ? `${b.color}22` : "#e2e8f0", border: `3px solid ${owned ? b.color : "#cbd5e1"}` }}
                title={b.name}
                aria-label={b.name}
              >
                {b.emoji}
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => { playSound("click"); navigate("/world"); }}
            className="font-fun btn-3d rounded-2xl bg-emerald-500 px-8 py-4 text-xl font-extrabold text-white"
          >
            Keep Exploring →
          </button>
        </div>
      </div>
    </div>
  );
}
