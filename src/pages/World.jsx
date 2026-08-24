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
      <ellipse cx="30" cy="40" rx="34" ry="22" fill="#a5d66f" />
      <ellipse cx="75" cy="34" rx="30" ry="20" fill="#b6df84" />
      <rect x="0" y="46" width="100" height="16" fill="#93c94f" />
      <path d="M12 60 Q30 46 42 40 Q56 32 68 30 Q82 28 86 20" stroke="#e8d9a8" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="0.1 6" />
      <path d="M0 56 Q25 50 40 56 Q60 64 100 54 L100 62 L0 62 Z" fill="url(#wRiver)" />
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
  const { progress, player, playSound, speak, say, softStopSpeaking, startAmbient, stopAmbient, lang } = useGame();
  const [picker, setPicker] = useState(null);

  useEffect(() => {
    startAmbient("birds");
    const t = setTimeout(() => say(lang === "hi" ? [`नमस्ते ${player?.name || ""}!`, "जगह चुनो!"] : [`Hi ${player?.name || "Explorer"}!`, "Pick a place!"]), 600);
    return () => { clearTimeout(t); softStopSpeaking(2400); stopAmbient(); };
  }, [lang]);

  const openMission = (m) => {
    if (!m.unlocked) {
      playSound("lock");
      speak(lang === "hi" ? "ये जगह अभी बंद है।" : "This place is still locked.");
      return;
    }
    playSound("world");
    playSound("birdChirp");
    speak(lang === "hi" ? `${m.name} चलें!` : `Let's go to ${m.name}!`);
    if (m.scenarios.length === 1) navigate(`/scenario/${m.scenarios[0]}`);
    else if (m.scenarios.length > 1) setPicker(m);
  };

  return (
    <div className="min-h-screen">
      <GameNav />
      <div className="mx-auto max-w-6xl px-3 py-3">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="font-fun text-lg font-extrabold text-white drop-shadow sm:text-xl">
            {lang === "hi" ? `हाय ${player?.name || ""}! जगह चुनो 🗺️` : `Hi ${player?.name || "Explorer"}! Pick a place 🗺️`}
          </h1>
          <div className="font-fun flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-sm font-extrabold text-slate-800 shadow">
            <Star size={14} fill="#1e293b" /> {progress.stars}
          </div>
        </div>

        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[2rem] border-8 border-white/70 shadow-2xl">
          <WorldBg />
          {missions.map((m) => {
            const done = m.scenarios.some((sid) => progress.completed[sid]);
            const scenario = m.scenarios[0] ? scenarioService.getById(m.scenarios[0]) : null;
            return (
              <motion.button
                key={m.id}
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: Math.random() * 0.4 }}
                whileHover={{ scale: m.unlocked ? 1.12 : 1, y: m.unlocked ? -4 : 0 }} whileTap={{ scale: 0.95 }}
                onClick={() => openMission(m)}
                onMouseEnter={() => m.unlocked && playSound("hover")}
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                aria-label={m.name}
              >
                <div className="anim-float-med flex flex-col items-center">
                  <div className="relative">
                    {scenario?.photo ? (
                      <div className="h-14 w-14 overflow-hidden rounded-2xl border-4 border-white shadow-xl sm:h-16 sm:w-16">
                        <img src={scenario.photo} alt="" className={`h-full w-full object-cover ${m.unlocked ? "" : "grayscale opacity-60"}`} />
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-xl sm:h-16 sm:w-16" style={{ background: m.unlocked ? "white" : "#cbd5e1" }}>
                        <span className={m.unlocked ? "" : "opacity-40 grayscale"}>{m.emoji}</span>
                      </div>
                    )}
                    {!m.unlocked && <div className="absolute -right-1 -top-1 rounded-full bg-slate-500 p-1 text-white shadow"><Lock size={10} /></div>}
                    {m.unlocked && done && <div className="absolute -right-1 -top-1 rounded-full bg-emerald-500 p-1 text-white shadow"><Check size={10} strokeWidth={4} /></div>}
                  </div>
                  <span className="font-fun mt-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold shadow sm:text-[10px]" style={{ background: m.unlocked ? m.color : "#94a3b8", color: "white" }}>
                    {m.emoji} {m.name.split(" ")[0]}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Real photo strip */}
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {scenarioService.getAll().slice(0, 6).map((s) => (
            <button key={s.id} onClick={() => navigate(`/scenario/${s.id}`)} className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-white shadow">
              <img src={s.photo} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {picker && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPicker(null)}>
            <motion.div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl" initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-fun text-xl font-extrabold text-purple-700">{picker.emoji} {picker.name}</h3>
                <button onClick={() => setPicker(null)} className="rounded-full bg-slate-100 p-2"><X size={18} /></button>
              </div>
              <div className="space-y-2.5">
                {picker.scenarios.map((sid) => {
                  const s = scenarioService.getById(sid);
                  const done = progress.completed[sid];
                  return (
                    <motion.button key={sid} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onMouseEnter={() => playSound("hover")} onClick={() => { playSound("click"); speak(s[lang]?.title || s.title); navigate(`/scenario/${sid}`); }} className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-3 text-left hover:bg-purple-50">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl"><img src={s.photo} alt="" className="h-full w-full object-cover" /></div>
                      <span className="flex-1"><span className="font-fun block text-sm font-bold text-slate-800">{s[lang]?.title || s.title}</span><span className="text-xs text-slate-500">{s.category}</span></span>
                      {done && <Check className="text-emerald-500" strokeWidth={4} size={20} />}
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
