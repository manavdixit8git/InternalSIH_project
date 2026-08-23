import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import characters from "../data/characters.json";
import { useGame } from "../context/GameContext";
import { BigButton, SkyBackground, PlayerAvatar } from "../components/ui/Kit";

const AGE_GROUPS = [
  { id: "5-7", label: "5 – 7", emoji: "🐣" },
  { id: "8-10", label: "8 – 10", emoji: "🦋" },
  { id: "11-12", label: "11 – 12", emoji: "🚀" },
];

export default function CreatePlayer() {
  const navigate = useNavigate();
  const { setPlayer, playSound, speak, say, speakAs, softStopSpeaking, speaking } = useGame();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(characters[0].id);
  const [ageGroup, setAgeGroup] = useState("8-10");

  const chosen = characters.find((c) => c.id === avatar);

  useEffect(() => {
    const t = setTimeout(() => say(["Who's playing?", "Type your name, then pick your buddy!"]), 500);
    return () => {
      clearTimeout(t);
      softStopSpeaking(2400);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    playSound("pop");
    playSound("cheer");
    const finalName = name.trim() || "Explorer";
    speak(`Let's go, ${finalName}! Time for an adventure!`);
    setPlayer({ name: finalName, avatar, ageGroup, createdAt: Date.now() });
    navigate("/world");
  };

  return (
    <SkyBackground>
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center px-4 py-8">
        <button
          onClick={() => { playSound("click"); navigate("/"); }}
          className="font-fun mb-4 flex items-center gap-1.5 self-start rounded-full bg-white/80 px-4 py-2 font-bold text-purple-700 shadow"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <motion.h1
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="font-fun title-shadow text-4xl font-extrabold text-white sm:text-5xl"
        >
          Who's Playing?
        </motion.h1>

        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
          className="my-4"
        >
          <div className="anim-bob">
            <PlayerAvatar emoji={chosen.emoji} color={chosen.color} size={110} talking={speaking} />
          </div>
        </motion.div>

        <div className="w-full max-w-2xl rounded-3xl bg-white/90 p-5 shadow-xl backdrop-blur sm:p-7">
          {/* Name */}
          <label className="font-fun mb-1.5 block text-lg font-bold text-slate-700">My name is…</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type your name"
            maxLength={16}
            className="font-fun mb-5 w-full rounded-2xl border-4 border-purple-200 bg-white px-4 py-3 text-xl font-semibold text-slate-800 outline-none focus:border-purple-400"
          />

          {/* Avatar */}
          <p className="font-fun mb-2 text-lg font-bold text-slate-700">Pick your buddy</p>
          <div className="mb-5 grid grid-cols-4 gap-2 sm:gap-3">
            {characters.map((c) => (
              <motion.button
                key={c.id}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  playSound(c.id === "cat" ? "catMeow" : c.id === "owl" ? "birdChirp" : "pop");
                  setAvatar(c.id);
                  speakAs(c.name, "kid");
                }}
                className={`flex flex-col items-center gap-1 rounded-2xl p-2 transition ${
                  avatar === c.id ? "bg-purple-100 ring-4 ring-purple-400" : "bg-slate-50 hover:bg-slate-100"
                }`}
                aria-pressed={avatar === c.id}
              >
                <span className="text-3xl sm:text-4xl">{c.emoji}</span>
                <span className="text-[10px] font-bold text-slate-500 sm:text-xs">{c.name.split(" ")[0]}</span>
              </motion.button>
            ))}
          </div>

          {/* Age group */}
          <p className="font-fun mb-2 text-lg font-bold text-slate-700">My age</p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {AGE_GROUPS.map((g) => (
              <motion.button
                key={g.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { playSound("click"); setAgeGroup(g.id); }}
                className={`font-fun flex flex-col items-center gap-0.5 rounded-2xl py-3 font-extrabold transition ${
                  ageGroup === g.id ? "bg-emerald-400 text-white ring-4 ring-emerald-200" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
                aria-pressed={ageGroup === g.id}
              >
                <span className="text-2xl">{g.emoji}</span>
                <span>{g.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <BigButton onClick={submit} color="#22c55e" className="px-10 py-5 text-2xl">
            LET'S GO! <ArrowRight size={26} />
          </BigButton>
        </div>
      </div>
    </SkyBackground>
  );
}
