import { NavLink, useNavigate } from "react-router-dom";
import { Map, Trophy, Award, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useGame } from "../../context/GameContext";
import { PlayerAvatar, AudioButton, XPBar } from "./Kit";
import characters from "../../data/characters.json";

const links = [
  { to: "/world", icon: Map, label: "World", say: "World map" },
  { to: "/progress", icon: Trophy, label: "Journey", say: "My journey" },
  { to: "/rewards", icon: Award, label: "Badges", say: "My badges" },
  { to: "/parent", icon: Users, label: "Grown-ups", say: "Grown ups corner" },
];

export default function GameNav() {
  const { player, progress, playSound, speak, speaking } = useGame();
  const navigate = useNavigate();
  const avatar = characters.find((c) => c.id === player?.avatar) || characters[0];

  return (
    <header className="sticky top-0 z-40 border-b-4 border-white/40 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 sm:gap-4 sm:px-5">
        <button
          onClick={() => {
            playSound("click");
            navigate("/");
          }}
          className="flex items-center gap-2"
          aria-label="Home"
        >
          <span className="text-2xl">🌍</span>
          <span className="font-fun hidden text-lg font-extrabold text-purple-700 sm:block">
            Choice World
          </span>
        </button>

        <nav className="flex flex-1 items-center justify-center gap-1 sm:gap-2">
          {links.map(({ to, icon: Icon, label, say }) => (
            <NavLink
              key={to}
              to={to}
              onMouseEnter={() => playSound("hover")}
              onClick={() => {
                playSound("click");
                speak(say);
              }}
              className={({ isActive }) =>
                `font-fun flex flex-col items-center rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition sm:flex-row sm:gap-1.5 sm:text-sm ${
                  isActive ? "bg-purple-600 text-white shadow-md" : "text-purple-700 hover:bg-purple-100"
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden w-36 md:block">
          <div className="rounded-xl bg-purple-600/90 px-3 py-1.5">
            <XPBar xp={progress.xp} />
          </div>
        </div>

        <AudioButton />

        <motion.div whileHover={{ scale: 1.08 }} className="flex items-center gap-2">
          <PlayerAvatar emoji={avatar.emoji} color={avatar.color} size={44} talking={speaking} />
        </motion.div>
      </div>
    </header>
  );
}


