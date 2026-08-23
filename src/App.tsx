import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { GameProvider } from "./context/GameContext";
import Landing from "./pages/Landing";
import CreatePlayer from "./pages/CreatePlayer";
import World from "./pages/World";
import Scenario from "./pages/Scenario";
import Progress from "./pages/Progress";
import Rewards from "./pages/Rewards";
import Parent from "./pages/Parent";

export default function App() {
  return (
    <HashRouter>
      <GameProvider>
        <div className="min-h-screen bg-gradient-to-b from-sky-400 to-emerald-200">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/create-player" element={<CreatePlayer />} />
              <Route path="/world" element={<World />} />
              <Route path="/scenario/:id" element={<Scenario />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/parent" element={<Parent />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </GameProvider>
    </HashRouter>
  );
}
