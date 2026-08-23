import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useGame } from "../context/GameContext";
import GameNav from "../components/ui/GameNav";
import badgesData from "../data/badges.json";

export default function Rewards() {
  const navigate = useNavigate();
  const { progress, playSound, say, speak, softStopSpeaking } = useGame();
  const ownedCount = progress.badges.length;

  useEffect(() => {
    const t = setTimeout(
      () =>
        say([
          "These are your badges!",
          `You collected ${ownedCount} out of ${badgesData.length}.`,
          "Tap a badge to hear about it!",
        ]),
      600
    );
    return () => {
      clearTimeout(t);
      softStopSpeaking(2400);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen">
      <GameNav />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="font-fun mb-1 text-center text-4xl font-extrabold text-white drop-shadow sm:text-5xl">
          My Badges 🏅
        </h1>
        <p className="font-fun mb-6 text-center text-lg font-bold text-white/90 drop-shadow">
          You've collected {ownedCount} of {badgesData.length}!
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {badgesData.map((b, i) => {
            const owned = progress.badges.includes(b.id);
            return (
              <motion.div
                key={b.id}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.06, type: "spring" }}
                whileHover={{ scale: owned ? 1.06 : 1.02, y: -4 }}
                whileTap={{ scale: 0.97 }}
                role="button"
                tabIndex={0}
                onClick={() => {
                  playSound(owned ? "badge" : "lock");
                  speak(owned ? `${b.name}! ${b.description}` : `${b.name}. Keep playing to unlock this badge!`);
                }}
                onKeyDown={(e) => e.key === "Enter" && speak(`${b.name}. ${b.description}`)}
                className="relative flex cursor-pointer flex-col items-center rounded-3xl bg-white/95 p-5 text-center shadow-xl"
              >
                <div
                  className={`mb-3 flex h-24 w-24 items-center justify-center rounded-full text-5xl shadow-inner ${owned ? "" : "grayscale"}`}
                  style={{
                    background: owned ? `${b.color}22` : "#e2e8f0",
                    border: `5px solid ${owned ? b.color : "#cbd5e1"}`,
                    opacity: owned ? 1 : 0.6,
                  }}
                >
                  {owned ? <span className="anim-float-med">{b.emoji}</span> : <Lock className="text-slate-400" size={34} />}
                </div>
                <h3 className="font-fun text-lg font-extrabold" style={{ color: owned ? b.color : "#94a3b8" }}>
                  {b.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {owned ? b.description : "Keep playing to unlock!"}
                </p>
                {owned && (
                  <span className="mt-2 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700">
                    ✓ Earned
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => { playSound("click"); navigate("/world"); }}
            className="font-fun btn-3d rounded-2xl bg-purple-600 px-8 py-4 text-xl font-extrabold text-white"
          >
            Earn More Badges →
          </button>
        </div>
      </div>
    </div>
  );
}
