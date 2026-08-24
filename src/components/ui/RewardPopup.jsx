import { useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useGame } from "../../context/GameContext";

export default function RewardPopup({ xp, badge, onContinue, onNext }) {
  const { playSound, say, stopSpeaking, lang } = useGame();

  useEffect(() => {
    playSound("reward");
    const lines = badge
      ? lang === "hi"
        ? [`आपने ${badge.name} बैज जीता!`, `${xp} XP! बहुत बढ़िया!`]
        : [`You earned the ${badge.name} badge!`, `Plus ${xp} XP! Amazing!`]
      : lang === "hi"
      ? [`शाबाश! ${xp} XP मिला!`]
      : [`Great job! ${xp} XP!`];
    const t = setTimeout(() => say(lines), 800);
    return () => { clearTimeout(t); stopSpeaking(); };
  }, [lang]);

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2.5 w-2.5 rounded-sm"
            style={{ left: `${Math.random() * 100}%`, background: ["#f87171", "#fbbf24", "#34d399", "#60a5fa", "#c084fc"][i % 5] }}
            initial={{ y: -30, rotate: 0, opacity: 1 }} animate={{ y: "110vh", rotate: 720, opacity: [1, 1, 0] }}
            transition={{ duration: 2.5 + Math.random() * 1.5, delay: Math.random(), repeat: Infinity }}
          />
        ))}
      </div>

      <motion.div className="relative w-full max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-2xl" initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 120 }}>
        <p className="font-fun text-sm font-extrabold tracking-widest text-purple-600">
          {lang === "hi" ? "तुमने जीता" : "YOU EARNED"}
        </p>

        {badge ? (
          <>
            <motion.div className="mx-auto my-3 flex h-24 w-24 items-center justify-center rounded-full text-5xl shadow-lg" style={{ background: `${badge.color}22`, border: `4px solid ${badge.color}` }} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", delay: 0.2 }}>
              <span className="anim-wiggle">{badge.emoji}</span>
            </motion.div>
            <h3 className="font-fun text-xl font-extrabold" style={{ color: badge.color }}>{badge.name}</h3>
          </>
        ) : (
          <motion.div className="mx-auto my-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
            <span className="anim-wiggle">⭐</span>
          </motion.div>
        )}

        <motion.div className="font-fun mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-4 py-1.5 text-lg font-extrabold text-white shadow" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.4 }}>
          <Star size={18} fill="white" /> +{xp} XP
        </motion.div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button onClick={() => { playSound("click"); stopSpeaking(); onNext(); }} className="font-fun btn-3d rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-extrabold text-white">
            {lang === "hi" ? "अगला →" : "Next →"}
          </button>
          <button onClick={() => { playSound("click"); stopSpeaking(); onContinue(); }} className="font-fun rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600">
            {lang === "hi" ? "नक्शा" : "Map"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
