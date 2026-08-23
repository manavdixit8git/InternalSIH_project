import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ArrowLeft, Home, Volume2 } from "lucide-react";
import { scenarioService } from "../services/scenarioService";
import { useGame } from "../context/GameContext";
import ScenarioScene from "../components/scene/ScenarioScene";
import { Sparkles } from "../components/scene/SceneAtoms";
import RewardPopup from "../components/ui/RewardPopup";
import { AudioButton, XPBar, TalkingWaves } from "../components/ui/Kit";
import characters from "../data/characters.json";
import sceneAudio from "../data/sceneAudio.json";

export default function Scenario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isDemo = params.get("demo") === "1";
  const {
    player, progress, recordChoice, playSound, speak, speakAs,
    stopSpeaking, speaking, voiceOn, setMusicMood, startAmbient, stopAmbient,
  } = useGame();

  const scenario = useMemo(() => scenarioService.getById(id), [id]);
  const allScenarios = scenarioService.getAll();
  const audioCfg = sceneAudio[id] || { character: "guide", ambient: "none" };

  const [phase, setPhase] = useState("play");
  const [chosen, setChosen] = useState(null);
  const [sceneState, setSceneState] = useState("normal");
  const [zoom, setZoom] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const timers = useRef([]);

  const guide = characters.find((c) => c.id === player?.avatar) || characters[3];

  const addTimer = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  };
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  /* ---------- Setup / narration on scenario load ---------- */
  useEffect(() => {
    if (!scenario) return;
    clearTimers();
    stopSpeaking();
    setPhase("play");
    setChosen(null);
    setSceneState("normal");
    setZoom(false);
    setShowReward(false);
    setEarnedBadge(null);
    setShowQuestion(false);

    setMusicMood("calm");
    startAmbient(audioCfg.ambient);

    // Narrate the situation, then reveal the choices
    addTimer(() => {
      if (voiceOn) {
        speakAs(scenario.intro, "narrator", {
          onEnd: () => {
            setShowQuestion(true);
            addTimer(() => speakAs(scenario.question, "guide"), 250);
          },
        });
      } else {
        setShowQuestion(true);
      }
    }, 900);

    // Safety net so choices always appear even if speech stalls
    addTimer(() => setShowQuestion(true), 7000);

    return () => {
      clearTimers();
      stopSpeaking();
      stopAmbient();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!scenario) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-sky-300 p-6 text-center">
        <p className="font-fun text-2xl font-bold text-white">Oops! That adventure isn't ready yet.</p>
        <button onClick={() => navigate("/world")} className="font-fun rounded-2xl bg-white px-6 py-3 font-bold text-purple-700 shadow">
          Back to World
        </button>
      </div>
    );
  }

  /* ---------- Making a choice ---------- */
  const handleChoose = (choice) => {
    if (phase !== "play") return;
    clearTimers();
    stopSpeaking();
    playSound("whoosh");
    setChosen(choice);
    setZoom(true);

    addTimer(() => {
      setSceneState(choice.state);
      setPhase("consequence");
      const result = recordChoice(scenario, choice);

      if (choice.type === "positive") {
        playSound("positive");
        setMusicMood("happy");
        startAmbient(audioCfg.ambient === "none" ? "birds" : audioCfg.ambient);
        addTimer(() => playSound(audioCfg.positiveSfx || "birdChirp"), 700);

        // Character speaks, then the lesson is explained
        addTimer(() => {
          speakAs(choice.characterMessage, audioCfg.character, {
            onEnd: () => speakAs(choice.message, "narrator"),
          });
        }, 1000);

        setEarnedBadge(result.newBadge);
        if (result.newBadge) addTimer(() => playSound("badge"), 1400);
        addTimer(() => setShowReward(true), 3200);
      } else {
        playSound("negative");
        setMusicMood("tense");
        stopAmbient();
        addTimer(() => playSound(audioCfg.negativeSfx || "sad"), 600);

        addTimer(() => {
          speakAs(choice.characterMessage, audioCfg.character, {
            onEnd: () =>
              speakAs(choice.message, "narrator", {
                onEnd: () => addTimer(() => speak("Let's try again!"), 400),
              }),
          });
        }, 1100);
      }
      addTimer(() => setZoom(false), 900);
    }, 500);
  };

  const tryAgain = () => {
    clearTimers();
    stopSpeaking();
    playSound("click");
    setPhase("play");
    setChosen(null);
    setSceneState("normal");
    setZoom(false);
    setShowQuestion(true);
    setMusicMood("calm");
    startAmbient(audioCfg.ambient);
    addTimer(() => speakAs(scenario.question, "guide"), 400);
  };

  const goNext = () => {
    playSound("click");
    stopSpeaking();
    const idx = allScenarios.findIndex((s) => s.id === scenario.id);
    const next = allScenarios[(idx + 1) % allScenarios.length];
    navigate(`/scenario/${next.id}${isDemo ? "?demo=1" : ""}`);
  };

  const replayLine = () => {
    if (phase === "play") speakAs(`${scenario.intro} ${scenario.question}`, "narrator");
    else speakAs(`${chosen.characterMessage}. ${chosen.message}`, audioCfg.character);
  };

  const positiveDone = phase === "consequence" && chosen?.type === "positive";
  const negativeDone = phase === "consequence" && chosen?.type === "negative";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900">
      {/* ===== Scene ===== */}
      <div className="absolute inset-0">
        <ScenarioScene scene={scenario.scene} state={sceneState} zoom={zoom} />
      </div>
      <Sparkles show={positiveDone} />

      {/* ===== Top HUD ===== */}
      <div className="absolute left-0 right-0 top-0 z-30 p-3 sm:p-4">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <button
            onClick={() => { playSound("click"); stopSpeaking(); navigate(isDemo ? "/" : "/world"); }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md"
            aria-label="Back"
          >
            {isDemo ? <Home size={22} /> : <ArrowLeft size={22} />}
          </button>
          <div className="flex-1 rounded-2xl bg-white/90 px-4 py-2 shadow-md backdrop-blur">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-fun text-base font-extrabold leading-tight text-slate-800 sm:text-lg">
                  {scenario.title}
                </p>
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                  style={{ background: scenario.categoryColor }}
                >
                  {scenario.category}
                </span>
              </div>
              <div className="hidden w-40 sm:block">
                <div className="rounded-xl bg-purple-600 px-3 py-1.5">
                  <XPBar xp={progress.xp} />
                </div>
              </div>
            </div>
          </div>
          <AudioButton />
        </div>
      </div>

      {/* ===== Bottom dialogue + choices ===== */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-3 sm:p-5">
        <div className="mx-auto max-w-3xl">
          {/* Dialogue bubble */}
          <motion.div layout className="mb-3 flex items-end gap-3">
            <motion.div
              className="anim-bob relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-4xl shadow-lg"
              style={{ boxShadow: `0 0 0 4px ${guide.color}55` }}
              animate={speaking ? { scale: [1, 1.09, 1] } : negativeDone ? { rotate: [0, -6, 6, 0] } : {}}
              transition={speaking ? { duration: 0.35, repeat: Infinity } : {}}
            >
              {phase === "consequence" ? (chosen.type === "positive" ? "😄" : "😟") : guide.emoji}
              {speaking && (
                <span
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: `0 0 0 8px ${guide.color}33`, animation: "pulse-ring 1s ease-out infinite" }}
                />
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={phase + (chosen?.id || "")}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                className="relative flex-1 rounded-2xl rounded-bl-none bg-white p-4 pr-14 shadow-xl"
              >
                {phase === "play" ? (
                  <p className="font-fun text-lg font-bold text-slate-800 sm:text-xl">{scenario.intro}</p>
                ) : (
                  <>
                    <p className="font-fun text-base font-bold text-slate-800 sm:text-lg">
                      💬 “{chosen.characterMessage}”
                    </p>
                    <p className="mt-1.5 text-sm text-slate-600 sm:text-base">{chosen.message}</p>
                  </>
                )}

                {/* replay narration */}
                <button
                  onClick={replayLine}
                  aria-label="Hear this again"
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-600 transition hover:bg-purple-200 active:scale-90"
                >
                  <Volume2 size={18} />
                </button>

                {speaking && (
                  <span className="absolute bottom-2 right-4">
                    <TalkingWaves active color={guide.color} />
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Choices */}
          <AnimatePresence>
            {phase === "play" && showQuestion && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                <p className="font-fun mb-2 text-center text-lg font-extrabold text-white drop-shadow sm:text-xl">
                  {scenario.question}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {scenario.choices.map((choice, i) => (
                    <motion.button
                      key={choice.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.12 }}
                      whileHover={{ scale: 1.04, y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      onMouseEnter={() => playSound("hover")}
                      onClick={() => handleChoose(choice)}
                      className="btn-3d font-fun flex items-center gap-3 rounded-2xl bg-white px-4 py-4 text-left"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                        {choice.emoji}
                      </span>
                      <span className="flex-1 text-lg font-extrabold text-slate-800 sm:text-xl">
                        {choice.text}
                      </span>
                      {/* tap to hear this option (great for young readers) */}
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`Hear option: ${choice.text}`}
                        onClick={(e) => { e.stopPropagation(); speakAs(choice.text, "guide"); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); speakAs(choice.text, "guide"); }
                        }}
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 active:scale-90"
                      >
                        <Volume2 size={17} />
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Negative → Try Again */}
            {negativeDone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={tryAgain}
                  className="btn-3d font-fun flex items-center gap-2 rounded-2xl bg-amber-400 px-8 py-4 text-xl font-extrabold text-slate-900"
                >
                  <RotateCcw size={24} /> Try Again
                </motion.button>
                <p className="font-fun text-center text-sm font-semibold text-white/90 drop-shadow">
                  Let's see what we can do differently! 💛
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== Reward popup ===== */}
      <AnimatePresence>
        {showReward && (
          <RewardPopup
            xp={chosen.reward}
            badge={earnedBadge}
            onContinue={() => { stopSpeaking(); navigate(isDemo && !player ? "/create-player" : "/world"); }}
            onNext={goNext}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
