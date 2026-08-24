import { NavLink, useNavigate } from "react-router-dom";
import { Map, Trophy, Award, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useGame } from "../../context/GameContext";
import { PlayerAvatar, AudioButton, LangToggle, XPBar } from "./Kit";
import characters from "../../data/characters.json";

const links = [
  { to: "/world", icon: Map, label: "World", label_hi: "दुनिया", say_en: "World map", say_hi: "दुनिया का नक्शा" },
  { to: "/progress", icon: Trophy, label: "Journey", label_hi: "सफ़र", say_en: "My journey", say_hi: "मेरा सफर" },
  { to: "/rewards", icon: Award, label: "Badges", label_hi: "बैज", say_en: "My badges", say_hi: "मेरे बैज" },
  { to: "/parent", icon: Users, label: "Grown-ups", label_hi: "बड़े", say_en: "Grown ups corner", say_hi: "बड़ों के लिए" },
];

export default function GameNav() {
  const { player, progress, playSound, speak, speaking, lang } = useGame();
  const navigate = useNavigate();
  const avatar = characters.find((c) => c.id === player?.avatar) || characters[0];

  return (
    <header className="sticky top-0 z-40 border-b-4 border-white/40 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
        <button
          onClick={() => {
            playSound("click");
            navigate("/");
          }}
          className="flex items-center gap-1.5"
          aria-label="Home"
        >
          <span className="text-2xl">🌍</span>
          <span className="font-fun hidden text-[15px] font-extrabold text-purple-700 sm:block">
            Choice World
          </span>
        </button>

        <nav className="flex flex-1 items-center justify-center gap-1">
          {links.map(({ to, icon: Icon, label, label_hi, say_en, say_hi }) => (
            <NavLink
              key={to}
              to={to}
              onMouseEnter={() => playSound("hover")}
              onClick={() => {
                playSound("click");
                speak(lang === "hi" ? say_hi : say_en);
              }}
              className={({ isActive }) =>
                `font-fun flex items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-bold transition sm:px-2.5 sm:text-xs ${
                  isActive ? "bg-purple-600 text-white shadow-md" : "text-purple-700 hover:bg-purple-100"
                }`
              }
            >
              <Icon size={16} />
              <span>{lang === "hi" ? label_hi : label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden w-28 md:block">
          <div className="rounded-xl bg-purple-600/90 px-2.5 py-1">
            <XPBar xp={progress.xp} />
          </div>
        </div>

        <LangToggle />
        <AudioButton />

        <motion.div whileHover={{ scale: 1.08 }} className="flex items-center gap-2">
          <PlayerAvatar emoji={avatar.emoji} color={avatar.color} size={40} talking={speaking} />
        </motion.div>
      </div>
    </header>
  );
}
