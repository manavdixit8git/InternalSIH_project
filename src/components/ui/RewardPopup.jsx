import { useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useGame } from "../../context/GameContext";

export default function RewardPopup({ xp, badge, onContinue, onNext }) {
  const { playSound, say, stopSpeaking } = useGame();

  // Celebrate out loud 🎉
  useEffect(() => {
    playSound("reward");
    const lines = badge
      ? [`You earned the ${badge.name} badge!`, `Plus ${xp} experience points! Amazing work!`]
      : [`Great job! You earned ${xp} experience points!`];
    const t = setTimeout(() => say(lines), 900);
    return () => {
      clearTimeout(t);
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    >
      {/* confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 26 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-3 w-3 rounded-sm"
            style={{
              left: `${Math.random() * 100}%`,
              background: ["#f87171", "#fbbf24", "#34d399", "#60a5fa", "#c084fc"][i % 5],
            }}
            initial={{ y: -40, rotate: 0, opacity: 1 }}
            animate={{ y: "110vh", rotate: 720, opacity: [1, 1, 0] }}
            transition={{ duration: 2.5 + Math.random() * 1.5, delay: Math.random(), repeat: Infinity }}
          />
        ))}
      </div>

      <motion.div
        className="relative w-full max-w-sm rounded-[2rem] bg-white p-7 text-center shadow-2xl"
        initial={{ scale: 0.5, y: 60 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 120 }}
      >
        <motion.p
          className="font-fun text-xl font-extrabold text-purple-600"
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        >
          YOU EARNED
        </motion.p>

        {badge ? (
          <>
            <motion.div
              className="mx-auto my-4 flex h-28 w-28 items-center justify-center rounded-full text-6xl shadow-lg"
              style={{ background: `${badge.color}22`, border: `5px solid ${badge.color}` }}
              initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <span className="anim-wiggle">{badge.emoji}</span>
            </motion.div>
            <h3 className="font-fun text-2xl font-extrabold" style={{ color: badge.color }}>
              {badge.name}
            </h3>
            <p className="mt-1 text-slate-500">{badge.description}</p>
          </>
        ) : (
          <motion.div
            className="mx-auto my-5 flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 text-6xl"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
          >
            <span className="anim-wiggle">⭐</span>
          </motion.div>
        )}

        <motion.div
          className="font-fun mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2 text-2xl font-extrabold text-white shadow"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.4 }}
        >
          <Star size={22} fill="white" /> +{xp} XP
        </motion.div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => { playSound("click"); stopSpeaking(); onNext(); }}
            className="font-fun btn-3d rounded-2xl bg-emerald-500 px-6 py-3.5 text-lg font-extrabold text-white"
          >
            Next Adventure →
          </button>
          <button
            onClick={() => { playSound("click"); stopSpeaking(); onContinue(); }}
            className="font-fun rounded-2xl bg-slate-100 px-6 py-3 text-base font-bold text-slate-600"
          >
            Back to World Map
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
