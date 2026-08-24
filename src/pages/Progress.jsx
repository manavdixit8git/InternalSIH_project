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
  { name: "Environment", name_hi: "पर्यावरण", emoji: "🌱", color: "#22c55e" },
  { name: "Kindness", name_hi: "दयालुता", emoji: "❤️", color: "#ec4899" },
  { name: "Safety", name_hi: "सुरक्षा", emoji: "🛡️", color: "#f97316" },
  { name: "Social Skills", name_hi: "सामाजिक", emoji: "🤝", color: "#a855f7" },
  { name: "Responsibility", name_hi: "जिम्मेदारी", emoji: "💧", color: "#38bdf8" },
];

export default function Progress() {
  const navigate = useNavigate();
  const { player, progress, playSound, say, speak, softStopSpeaking, speaking, lang } = useGame();
  const avatar = characters.find((c) => c.id === player?.avatar) || characters[0];
  const total = scenarioService.getAll().length;
  const completed = progressService.completedCount();
  const level = Math.floor(progress.xp / 100) + 1;

  useEffect(() => {
    const t = setTimeout(
      () => say(lang === "hi" ? [`ये है तुम्हारा सफर, ${player?.name || ""}!`, `लेवल ${level}, ${progress.xp} XP।`, `${completed} मिशन पूरे!`] : [`This is your journey, ${player?.name || "Explorer"}!`, `Level ${level}, ${progress.xp} XP.`, `${completed} of ${total} done!`]),
      600
    );
    return () => { clearTimeout(t); softStopSpeaking(2400); };
  }, [lang]);

  const stats = [
    { icon: Zap, label: "XP", label_hi: "XP", value: progress.xp, color: "#f59e0b" },
    { icon: Star, label: "Stars", label_hi: "सितारे", value: progress.stars, color: "#eab308" },
    { icon: MapIcon, label: "Done", label_hi: "पूरे", value: `${completed}/${total}`, color: "#22c55e" },
    { icon: Award, label: "Badges", label_hi: "बैज", value: progress.badges.length, color: "#7c5cff" },
  ];

  return (
    <div className="min-h-screen">
      <GameNav />
      <div className="mx-auto max-w-4xl px-3 py-4">
        <h1 className="font-fun mb-3 text-center text-3xl font-extrabold text-white drop-shadow">
          {lang === "hi" ? "मेरा सफ़र ✨" : "My Journey ✨"}
        </h1>

        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-3 flex items-center gap-3 rounded-3xl bg-white/95 p-4 shadow-xl">
          <div className="anim-bob"><PlayerAvatar emoji={avatar.emoji} color={avatar.color} size={64} talking={speaking} /></div>
          <div className="flex-1">
            <p className="font-fun text-xl font-extrabold text-slate-800">{player?.name || "Explorer"}</p>
            <p className="font-fun text-sm font-bold text-purple-600">Lv {level}</p>
            <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-amber-500" initial={{ width: 0 }} animate={{ width: `${progress.xp % 100}%` }} transition={{ duration: 0.8 }} />
            </div>
          </div>
        </motion.div>

        <div className="mb-4 grid grid-cols-4 gap-2">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.06 }} className="rounded-2xl bg-white/95 p-2.5 text-center shadow">
              <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: s.color }}>
                <s.icon size={18} />
              </div>
              <p className="font-fun text-lg font-extrabold text-slate-800 leading-none">{s.value}</p>
              <p className="text-[10px] font-bold text-slate-500">{lang === "hi" ? s.label_hi : s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          {CATEGORIES.map((c, i) => {
            const pct = progressService.categoryPercent(c.name);
            return (
              <motion.div key={c.name} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-2.5 rounded-2xl bg-white/95 p-3 shadow">
                <span className="text-2xl">{c.emoji}</span>
                <div className="flex-1">
                  <div className="mb-1 flex justify-between">
                    <span className="font-fun text-sm font-bold text-slate-700">{lang === "hi" ? c.name_hi : c.name}</span>
                    <span className="font-fun text-xs font-extrabold" style={{ color: c.color }}>{pct}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <motion.div className="h-full rounded-full" style={{ background: c.color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {badgesData.map((b) => {
            const owned = progress.badges.includes(b.id);
            return (
              <button
                key={b.id}
                onClick={() => { playSound(owned ? "badge" : "lock"); speak(owned ? `${b.name}. ${b.description}` : lang === "hi" ? `${b.name} अभी बंद है` : `${b.name} locked`); }}
                className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow transition hover:scale-110 ${owned ? "" : "opacity-30 grayscale"}`}
                style={{ background: owned ? `${b.color}22` : "#e2e8f0", border: `3px solid ${owned ? b.color : "#cbd5e1"}` }}
              >
                {owned ? b.emoji : "🔒"}
              </button>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => { playSound("click"); navigate("/world"); }} className="font-fun btn-3d rounded-2xl bg-emerald-500 px-7 py-3 text-lg font-extrabold text-white">
            {lang === "hi" ? "और खेलो →" : "Keep Exploring →"}
          </button>
        </div>
      </div>
    </div>
  );
}
