import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useGame } from "../context/GameContext";
import GameNav from "../components/ui/GameNav";
import badgesData from "../data/badges.json";

export default function Rewards() {
  const navigate = useNavigate();
  const { progress, playSound, say, speak, softStopSpeaking, lang } = useGame();
  const ownedCount = progress.badges.length;

  useEffect(() => {
    const t = setTimeout(() => say(lang === "hi" ? [`तुम्हारे बैज!`, `${ownedCount} मिले, ${badgesData.length} में से।`, "बैज पर टैप करके सुनो!"] : [`Your badges!`, `${ownedCount} of ${badgesData.length}.`, "Tap a badge to hear!"]), 600);
    return () => { clearTimeout(t); softStopSpeaking(2400); };
  }, [lang]);

  return (
    <div className="min-h-screen">
      <GameNav />
      <div className="mx-auto max-w-4xl px-3 py-4">
        <h1 className="font-fun mb-1 text-center text-3xl font-extrabold text-white drop-shadow">
          {lang === "hi" ? "मेरे बैज 🏅" : "My Badges 🏅"}
        </h1>
        <p className="font-fun mb-4 text-center text-sm font-bold text-white/90 drop-shadow">
          {ownedCount} / {badgesData.length} {lang === "hi" ? "मिले" : "collected"}
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {badgesData.map((b, i) => {
            const owned = progress.badges.includes(b.id);
            return (
              <motion.div
                key={b.id}
                initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.05, type: "spring" }}
                whileHover={{ scale: owned ? 1.06 : 1.02, y: -3 }} whileTap={{ scale: 0.96 }}
                role="button" tabIndex={0}
                onClick={() => { playSound(owned ? "badge" : "lock"); speak(owned ? `${b.name}! ${b.description}` : lang === "hi" ? `${b.name} अभी बंद है` : `${b.name} locked`); }}
                onKeyDown={(e) => e.key === "Enter" && speak(`${b.name}. ${b.description}`)}
                className="relative flex cursor-pointer flex-col items-center rounded-3xl bg-white/95 p-4 text-center shadow-xl"
              >
                <div className={`mb-2 flex h-20 w-20 items-center justify-center rounded-full text-4xl shadow-inner ${owned ? "" : "grayscale"}`} style={{ background: owned ? `${b.color}22` : "#e2e8f0", border: `4px solid ${owned ? b.color : "#cbd5e1"}`, opacity: owned ? 1 : 0.6 }}>
                  {owned ? <span className="anim-float-med">{b.emoji}</span> : <Lock className="text-slate-400" size={28} />}
                </div>
                <h3 className="font-fun text-sm font-extrabold leading-tight" style={{ color: owned ? b.color : "#94a3b8" }}>{b.name}</h3>
                <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{owned ? b.description : lang === "hi" ? "खेल कर खोलो!" : "Play to unlock!"}</p>
                {owned && <span className="mt-2 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">✓</span>}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => { playSound("click"); navigate("/world"); }} className="font-fun btn-3d rounded-2xl bg-purple-600 px-7 py-3 text-lg font-extrabold text-white">
            {lang === "hi" ? "और बैज पाओ →" : "Earn More →"}
          </button>
        </div>
      </div>
    </div>
  );
}
