import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import characters from "../data/characters.json";
import { useGame } from "../context/GameContext";
import { BigButton, SkyBackground, PlayerAvatar, LangToggle } from "../components/ui/Kit";

const AGE_GROUPS = [
  { id: "5-7", label: "5-7", label_hi: "5-7", emoji: "🐣" },
  { id: "8-10", label: "8-10", label_hi: "8-10", emoji: "🦋" },
  { id: "11-12", label: "11-12", label_hi: "11-12", emoji: "🚀" },
];

export default function CreatePlayer() {
  const navigate = useNavigate();
  const { setPlayer, playSound, say, speakAs, softStopSpeaking, speaking, lang } = useGame();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(characters[0].id);
  const [ageGroup, setAgeGroup] = useState("8-10");

  const chosen = characters.find((c) => c.id === avatar);

  useEffect(() => {
    const t = setTimeout(() => say(lang === "hi" ? ["कौन खेल रहा है?", "अपना नाम लिखो और दोस्त चुनो!"] : ["Who's playing?", "Type your name, pick your buddy!"]), 500);
    return () => { clearTimeout(t); softStopSpeaking(2400); };
  }, [lang]);

  const submit = () => {
    playSound("cheer");
    const finalName = name.trim() || "Explorer";
    speakAs(lang === "hi" ? `चलो ${finalName}!` : `Let's go, ${finalName}!`, "kid");
    setPlayer({ name: finalName, avatar, ageGroup, createdAt: Date.now() });
    navigate("/world");
  };

  return (
    <SkyBackground>
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center px-4 py-6">
        <div className="flex w-full items-center justify-between">
          <button
            onClick={() => { playSound("click"); navigate("/"); }}
            className="font-fun flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-purple-700 shadow"
          >
            <ArrowLeft size={18} /> {lang === "hi" ? "पीछे" : "Back"}
          </button>
          <LangToggle />
        </div>

        <motion.h1 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-fun title-shadow mt-4 text-4xl font-extrabold text-white">
          {lang === "hi" ? "कौन खेल रहा है?" : "Who's Playing?"}
        </motion.h1>

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="my-3">
          <div className="anim-bob">
            <PlayerAvatar emoji={chosen.emoji} color={chosen.color} size={96} talking={speaking} />
          </div>
          <p className="font-fun mt-2 text-center text-lg font-bold text-white drop-shadow">{chosen.name.split(" ")[0]}</p>
        </motion.div>

        <div className="w-full max-w-xl rounded-3xl bg-white/90 p-4 shadow-xl backdrop-blur sm:p-5">
          {/* Visual name - minimal text */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl">✏️</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lang === "hi" ? "नाम लिखो..." : "Your name..."}
              maxLength={14}
              className="font-fun flex-1 rounded-2xl border-4 border-purple-200 bg-white px-4 py-2.5 text-lg font-bold text-slate-800 outline-none focus:border-purple-400"
            />
          </div>

          {/* Avatars - visual heavy */}
          <div className="mb-4 grid grid-cols-4 gap-2">
            {characters.map((c) => (
              <motion.button
                key={c.id}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  playSound(c.id === "cat" ? "catMeow" : "pop");
                  setAvatar(c.id);
                  speakAs(c.name, "kid");
                }}
                className={`flex flex-col items-center gap-1 rounded-2xl p-2.5 transition ${avatar === c.id ? "bg-purple-600 text-white shadow-lg ring-4 ring-purple-200" : "bg-slate-50"}`}
              >
                <span className="text-3xl">{c.emoji}</span>
              </motion.button>
            ))}
          </div>

          {/* Age - visual */}
          <div className="grid grid-cols-3 gap-2">
            {AGE_GROUPS.map((g) => (
              <motion.button
                key={g.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => { playSound("click"); setAgeGroup(g.id); }}
                className={`font-fun flex flex-col items-center gap-0.5 rounded-2xl py-2.5 font-extrabold transition ${ageGroup === g.id ? "bg-emerald-400 text-white ring-4 ring-emerald-200" : "bg-slate-50 text-slate-600"}`}
              >
                <span className="text-xl">{g.emoji}</span>
                <span className="text-sm">{lang === "hi" ? g.label_hi : g.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <BigButton onClick={submit} color="#22c55e" className="px-10 py-4 text-xl">
            {lang === "hi" ? "चलो!" : "LET'S GO!"} <ArrowRight size={22} />
          </BigButton>
        </div>
      </div>
    </SkyBackground>
  );
}
