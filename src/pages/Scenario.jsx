import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Home, Volume2, RotateCcw } from "lucide-react";
import { scenarioService } from "../services/scenarioService";
import { useGame } from "../context/GameContext";
import ScenarioScene from "../components/scene/ScenarioScene";
import { Sparkles } from "../components/scene/SceneAtoms";
import RewardPopup from "../components/ui/RewardPopup";
import { AudioButton, LangToggle, XPBar, TalkingWaves } from "../components/ui/Kit";
import characters from "../data/characters.json";
import sceneAudio from "../data/sceneAudio.json";

export default function Scenario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isDemo = params.get("demo") === "1";
  const {
    player, progress, recordChoice, playSound, speak, speakAs, say,
    stopSpeaking, softStopSpeaking, speaking, voiceOn, lang,
    setMusicMood, startAmbient, stopAmbient, L, choiceL,
  } = useGame();

  const scenario = useMemo(() => scenarioService.getById(id), [id]);
  const allScenarios = scenarioService.getAll();
  const audioCfg = sceneAudio[id] || { character: "guide", ambient: "birds" };

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

  // localized helpers
  const tTitle = L(scenario, "title") || scenario?.title || "";
  const tIntro = L(scenario, "intro") || scenario?.intro || "";
  const tQuestion = L(scenario, "question") || "";

  const getChoiceText = (idx, field) => {
    if (!scenario) return "";
    const pack = scenario[lang] || scenario.en;
    return pack?.choices?.[idx]?.[field] || scenario.choices?.[idx]?.[field] || "";
  };

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

    addTimer(() => {
      if (voiceOn) {
        speakAs(tIntro, "narrator", {
          onEnd: () => {
            setShowQuestion(true);
            addTimer(() => speakAs(tQuestion, "guide"), 250);
          },
        });
      } else {
        setShowQuestion(true);
      }
    }, 700);

    addTimer(() => setShowQuestion(true), 6500);

    return () => {
      clearTimers();
      softStopSpeaking(2600);
      stopAmbient();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, lang]);

  if (!scenario) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-sky-300 p-6 text-center">
        <p className="font-fun text-2xl font-bold text-white">Oops!</p>
        <button onClick={() => navigate("/world")} className="font-fun rounded-2xl bg-white px-6 py-3 font-bold text-purple-700 shadow">
          Back
        </button>
      </div>
    );
  }

  const handleChoose = (choice, idx) => {
    if (phase !== "play") return;
    clearTimers();
    stopSpeaking();
    playSound("whoosh");
    setChosen({ ...choice, idx });
    setZoom(true);

    addTimer(() => {
      setSceneState(choice.state);
      setPhase("consequence");
      const result = recordChoice(scenario, choice);

      const charMsg = getChoiceText(idx, "characterMessage");
      const explMsg = getChoiceText(idx, "message");

      if (choice.type === "positive") {
        playSound("positive");
        setMusicMood("happy");
        startAmbient(audioCfg.ambient === "none" ? "birds" : audioCfg.ambient);
        addTimer(() => playSound(audioCfg.positiveSfx || "birdChirp"), 600);
        addTimer(() => {
          speakAs(charMsg, audioCfg.character, {
            onEnd: () => speakAs(explMsg, "narrator"),
          });
        }, 900);
        setEarnedBadge(result.newBadge);
        if (result.newBadge) addTimer(() => playSound("badge"), 1300);
        addTimer(() => setShowReward(true), 3000);
      } else {
        playSound("negative");
        setMusicMood("tense");
        stopAmbient();
        addTimer(() => playSound(audioCfg.negativeSfx || "sad"), 600);
        addTimer(() => {
          speakAs(charMsg, audioCfg.character, {
            onEnd: () => speakAs(explMsg, "narrator", {
              onEnd: () => addTimer(() => speak(lang === "hi" ? "फिर कोशिश करें!" : "Let's try again!"), 350),
            }),
          });
        }, 900);
      }
      addTimer(() => setZoom(false), 800);
    }, 450);
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
    addTimer(() => speakAs(tQuestion, "guide"), 350);
  };

  const goNext = () => {
    playSound("click");
    stopSpeaking();
    const idx = allScenarios.findIndex((s) => s.id === scenario.id);
    const next = allScenarios[(idx + 1) % allScenarios.length];
    navigate(`/scenario/${next.id}${isDemo ? "?demo=1" : ""}`);
  };

  const replayLine = () => {
    if (phase === "play") speakAs(`${tIntro} ${tQuestion}`, "narrator");
    else {
      const cm = getChoiceText(chosen.idx, "characterMessage");
      const em = getChoiceText(chosen.idx, "message");
      speakAs(`${cm}. ${em}`, audioCfg.character);
    }
  };

  const positiveDone = phase === "consequence" && chosen?.type === "positive";
  const negativeDone = phase === "consequence" && chosen?.type === "negative";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900">
      {/* Real photo background */}
      <div className="absolute inset-0">
        <img
          src={scenario.photo}
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: sceneState === "negative" ? "grayscale(0.4) brightness(0.7)" : sceneState === "positive" ? "brightness(1.1) saturate(1.2)" : "brightness(0.95)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
      </div>

      {/* Animated SVG overlay for consequence */}
      <div className="absolute inset-0 opacity-80 mix-blend-normal">
        <ScenarioScene scene={scenario.scene} state={sceneState} zoom={zoom} />
      </div>

      <Sparkles show={positiveDone} />

      {/* Top bar - minimal */}
      <div className="absolute left-0 right-0 top-0 z-30 p-2.5 sm:p-3">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <button
            onClick={() => { playSound("click"); stopSpeaking(); navigate(isDemo ? "/" : "/world"); }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md"
            aria-label="Back"
          >
            {isDemo ? <Home size={20} /> : <ArrowLeft size={20} />}
          </button>

          <div className="flex-1 rounded-full bg-white/85 px-3 py-1.5 shadow backdrop-blur flex items-center gap-2">
            <span className="text-lg">{scenario.choices[0]?.emoji}</span>
            <span className="font-fun text-sm font-extrabold text-slate-800 truncate">{tTitle}</span>
            <span className="ml-auto hidden sm:flex">
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: scenario.categoryColor }}>
                {scenario.category}
              </span>
            </span>
          </div>

          <div className="hidden w-24 sm:block">
            <div className="rounded-xl bg-black/30 px-2 py-1 backdrop-blur">
              <XPBar xp={progress.xp} />
            </div>
          </div>

          <LangToggle />
          <AudioButton />
        </div>
      </div>

      {/* Center - visual situation card (tiny text) */}
      <div className="absolute left-1/2 top-[4.5rem] z-20 w-[92%] max-w-xl -translate-x-1/2 sm:top-20">
        <motion.div
          initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 rounded-3xl bg-white/90 p-3 shadow-xl backdrop-blur"
        >
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl">
            <img src={scenario.photo} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-fun text-[13px] font-bold leading-tight text-slate-700 line-clamp-2">
              {tIntro}
            </p>
          </div>
          <button
            onClick={replayLine}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600"
            aria-label="Hear"
          >
            <Volume2 size={18} />
          </button>
        </motion.div>
      </div>

      {/* Bottom - choices as visual cards */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-3 sm:p-4">
        <div className="mx-auto max-w-3xl">
          {/* Talking avatar strip - minimal */}
          <motion.div layout className="mb-3 flex items-center gap-2.5">
            <motion.div
              className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-lg"
              style={{ boxShadow: `0 0 0 3px ${guide.color}55` }}
              animate={speaking ? { scale: [1, 1.08, 1] } : {}}
              transition={speaking ? { duration: 0.35, repeat: Infinity } : {}}
            >
              {phase === "consequence" ? (chosen?.type === "positive" ? "😄" : "😟") : guide.emoji}
              {speaking && (
                <span className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 0 6px ${guide.color}33`, animation: "pulse-ring 1s ease-out infinite" }} />
              )}
            </motion.div>

            <div className="flex-1 rounded-2xl bg-white/90 px-3 py-2 shadow backdrop-blur flex items-center gap-2">
              <p className="font-fun flex-1 text-sm font-bold text-slate-800 truncate">
                {phase === "play" ? tQuestion : getChoiceText(chosen.idx, "characterMessage")}
              </p>
              {speaking && <TalkingWaves active color={guide.color} />}
            </div>
          </motion.div>

          <AnimatePresence>
            {phase === "play" && showQuestion && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="grid grid-cols-2 gap-3">
                {scenario.choices.map((choice, idx) => {
                  const label = lang === "hi" ? choice.label_hi : choice.label_en;
                  const text = getChoiceText(idx, "text");
                  return (
                    <motion.button
                      key={choice.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.03, y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      onMouseEnter={() => playSound("hover")}
                      onClick={() => handleChoose(choice, idx)}
                      className="group relative overflow-hidden rounded-[1.6rem] border-4 bg-white shadow-xl"
                      style={{ borderColor: choice.color }}
                    >
                      {/* choice photo */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <img src={choice.photo} alt={label} className="h-full w-full object-cover transition group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute left-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-2xl shadow">
                          {choice.emoji}
                        </div>
                        {/* speaker for choice */}
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label={`Hear ${text}`}
                          onClick={(e) => { e.stopPropagation(); speakAs(text, "guide"); }}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); speakAs(text, "guide"); } }}
                          className="absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 text-purple-600 shadow hover:bg-white"
                        >
                          <Volume2 size={16} />
                        </span>
                        <div className="absolute bottom-0 left-0 right-0 p-2.5">
                          <p className="font-fun text-lg font-extrabold leading-none text-white drop-shadow" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
                            {label}
                          </p>
                          <p className="mt-0.5 text-[11px] font-bold text-white/80 line-clamp-1">{text}</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}

            {negativeDone && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                  onClick={tryAgain}
                  className="btn-3d font-fun flex items-center gap-2 rounded-2xl bg-amber-400 px-7 py-3.5 text-lg font-extrabold text-slate-900"
                >
                  <RotateCcw size={20} /> {lang === "hi" ? "फिर कोशिश" : "Try Again"}
                </motion.button>
                <p className="font-fun text-xs font-semibold text-white/90 drop-shadow">
                  {lang === "hi" ? "चलो दूसरा चुनाव देखते हैं! 💛" : "Let's see what we can do differently! 💛"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
