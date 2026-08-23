import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, X, Star } from "lucide-react";
import missions from "../data/missions.json";
import { scenarioService } from "../services/scenarioService";
import { useGame } from "../context/GameContext";
import GameNav from "../components/ui/GameNav";
import { Sun, FlyingBird, Cloud, Tree, Bush, Critter } from "../components/scene/SceneAtoms";

function WorldBg() {
  return (
    <svg viewBox="0 0 100 62" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="wSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6cc0ff" />
          <stop offset="100%" stopColor="#cbefd6" />
        </linearGradient>
        <linearGradient id="wRiver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5fd0ff" />
          <stop offset="100%" stopColor="#1f9fe0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="62" fill="url(#wSky)" />
      <Sun x={88} y={9} />
      <Cloud x={20} y={10} scale={1} />
      <Cloud x={62} y={7} scale={0.8} />
      {/* land patches */}
      <ellipse cx="30" cy="40" rx="34" ry="22" fill="#a5d66f" />
      <ellipse cx="75" cy="34" rx="30" ry="20" fill="#b6df84" />
      <rect x="0" y="46" width="100" height="16" fill="#93c94f" />
      {/* winding path */}
      <path d="M12 60 Q30 46 42 40 Q56 32 68 30 Q82 28 86 20"
        stroke="#e8d9a8" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="0.1 6" />
      {/* river */}
      <path d="M0 56 Q25 50 40 56 Q60 64 100 54 L100 62 L0 62 Z" fill="url(#wRiver)" />
      {/* decorative trees & animals */}
      <Tree x={8} y={44} scale={0.8} />
      <Tree x={96} y={44} scale={0.9} />
      <Bush x={20} y={52} scale={0.9} />
      <Bush x={70} y={49} scale={0.8} />
      <Critter x={44} y={51} type="rabbit" />
      <Critter x={58} y={46} type="hedgehog" />
      <FlyingBird y={14} color="#5b8def" dur={22} />
      <FlyingBird y={22} color="#ef7d57" dur={28} delay={4} />
    </svg>
  );
}

export default function World() {
  const navigate = useNavigate();
  const { progress, player, playSound, speak, say, softStopSpeaking, startAmbient, stopAmbient } = useGame();
  const [picker, setPicker] = useState(null); // mission with multiple scenarios

  useEffect(() => {
    startAmbient("birds");
    const t = setTimeout(
      () => say([`Hi ${player?.name || "Explorer"}!`, "Pick a place to explore!"]),
      600
    );
    return () => {
      clearTimeout(t);
      softStopSpeaking(2400);
      stopAmbient();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openMission = (m) => {
    if (!m.unlocked) {
      playSound("lock");
      speak("This place is still locked. Play more adventures to open it!");
      return;
    }
    playSound("world");
    playSound("birdChirp");
    speak(`Let's go to ${m.name}!`);
    if (m.scenarios.length === 1) {
      navigate(`/scenario/${m.scenarios[0]}`);
    } else if (m.scenarios.length > 1) {
      setPicker(m);
    }
  };

  return (
    <div className="min-h-screen">
      <GameNav />
      <div className="mx-auto max-w-6xl px-3 py-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-fun text-2xl font-extrabold text-white drop-shadow sm:text-3xl">
            Hi {player?.name || "Explorer"}! Pick a place to explore 🗺️
          </h1>
          <div className="font-fun flex items-center gap-1.5 rounded-full bg-yellow-400 px-4 py-1.5 font-extrabold text-slate-800 shadow">
            <Star size={18} fill="#1e293b" /> {progress.stars} Stars
          </div>
        </div>

        {/* Map */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[2rem] border-8 border-white/70 shadow-2xl">
          <WorldBg />
          {missions.map((m) => {
            const done = m.scenarios.some((sid) => progress.completed[sid]);
            return (
              <motion.button
                key={m.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: Math.random() * 0.4 }}
                whileHover={{ scale: m.unlocked ? 1.12 : 1, y: m.unlocked ? -4 : 0 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openMission(m)}
                onMouseEnter={() => m.unlocked && playSound("hover")}
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                aria-label={m.name}
              >
                <div className="anim-float-med flex flex-col items-center">
                  <div
                    className="relative flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-xl sm:h-16 sm:w-16 sm:text-4xl"
                    style={{ background: m.unlocked ? "white" : "#cbd5e1" }}
                  >
                    <span className={m.unlocked ? "" : "opacity-40 grayscale"}>{m.emoji}</span>
                    {!m.unlocked && (
                      <div className="absolute -right-1 -top-1 rounded-full bg-slate-500 p-1 text-white shadow">
                        <Lock size={12} />
                      </div>
                    )}
                    {m.unlocked && done && (
                      <div className="absolute -right-1 -top-1 rounded-full bg-emerald-500 p-1 text-white shadow">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                  <span
                    className="font-fun mt-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow sm:text-xs"
                    style={{ background: m.unlocked ? m.color : "#94a3b8", color: "white" }}
                  >
                    {m.name}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Scenario picker for multi-scenario locations */}
      <AnimatePresence>
        {picker && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPicker(null)}
          >
            <motion.div
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
              initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-fun text-2xl font-extrabold text-purple-700">
                  {picker.emoji} {picker.name}
                </h3>
                <button onClick={() => setPicker(null)} className="rounded-full bg-slate-100 p-2" aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3">
                {picker.scenarios.map((sid) => {
                  const s = scenarioService.getById(sid);
                  const done = progress.completed[sid];
                  return (
                    <motion.button
                      key={sid}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onMouseEnter={() => playSound("hover")}
                      onClick={() => { playSound("click"); speak(s.title); navigate(`/scenario/${sid}`); }}
                      className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-4 text-left hover:bg-purple-50"
                    >
                      <span className="text-2xl">{s.choices[0].emoji}</span>
                      <span className="flex-1">
                        <span className="font-fun block text-lg font-bold text-slate-800">{s.title}</span>
                        <span className="text-sm text-slate-500">{s.category}</span>
                      </span>
                      {done && <Check className="text-emerald-500" strokeWidth={4} size={22} />}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
