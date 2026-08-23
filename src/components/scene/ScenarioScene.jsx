import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Cloud,
  Bird,
  FlyingBird,
  Tree,
  Bush,
  Critter,
} from "./SceneAtoms";

/* Sky gradient per state */
function skyStops(state) {
  if (state === "negative") return ["#6b7280", "#9ca3af"];
  if (state === "positive") return ["#57c1ff", "#bff0ff"];
  return ["#7ec8ff", "#cdeeff"];
}

function SkyBg({ state }) {
  const [a, b] = skyStops(state);
  return (
    <>
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <motion.stop offset="0%" animate={{ stopColor: a }} transition={{ duration: 1 }} />
          <motion.stop offset="100%" animate={{ stopColor: b }} transition={{ duration: 1 }} />
        </linearGradient>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4fc3f7" />
          <stop offset="100%" stopColor="#0288d1" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="62" fill="url(#skyGrad)" />
    </>
  );
}

/* ============ FACTORY ============ */
function FactoryScene({ state }) {
  const smokeCount = state === "negative" ? 8 : state === "positive" ? 0 : 4;
  const birdMood = state === "negative" ? "coughing" : state === "positive" ? "happy" : "normal";
  return (
    <g>
      <Sun x={84} y={12} dim={state === "negative"} />
      <Cloud x={18} y={12} scale={1.1} dark={state === "negative"} />
      <Cloud x={55} y={9} scale={0.8} dark={state === "negative"} />
      {/* ground */}
      <rect x="0" y="46" width="100" height="16" fill="#7cb342" />
      <rect x="0" y="46" width="100" height="3" fill="#8bc34a" />
      {/* factory building */}
      <g>
        <rect x="30" y="30" width="34" height="18" rx="1.5" fill="#8d6e63" />
        <rect x="33" y="34" width="5" height="5" fill="#ffe082" />
        <rect x="41" y="34" width="5" height="5" fill="#ffe082" />
        <rect x="49" y="34" width="5" height="5" fill="#ffe082" />
        <rect x="57" y="34" width="4" height="14" fill="#6d4c41" />
        {/* chimneys */}
        <rect x="35" y="20" width="6" height="12" fill="#a1887f" />
        <rect x="48" y="16" width="6" height="16" fill="#a1887f" />
        <rect x="34" y="19" width="8" height="2" fill="#6d4c41" />
        <rect x="47" y="15" width="8" height="2" fill="#6d4c41" />
      </g>
      {/* smoke */}
      <AnimatePresence>
        {Array.from({ length: smokeCount }).map((_, i) => {
          const src = i % 2 === 0 ? 38 : 51;
          const baseY = i % 2 === 0 ? 19 : 15;
          return (
            <motion.circle
              key={`${state}-${i}`}
              cx={src}
              initial={{ cy: baseY, opacity: 0, r: 2 }}
              animate={{ cy: baseY - 14, opacity: [0, 0.7, 0], r: 4.5 }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
              fill={state === "negative" ? "#4b5563" : "#9e9e9e"}
            />
          );
        })}
      </AnimatePresence>
      {/* trees + critters */}
      <Tree x={10} y={48} scale={0.9} />
      <Tree x={90} y={48} scale={1.05} />
      <Bush x={74} y={49} scale={0.9} />
      <Critter x={20} y={50} type="rabbit" />
      {/* birds */}
      {state === "positive" ? (
        <>
          <FlyingBird y={16} color="#5b8def" dur={11} />
          <FlyingBird y={24} color="#ef7d57" dur={14} delay={2} />
        </>
      ) : (
        <>
          <Bird x={16} y={22} mood={birdMood} color="#5b8def" />
          <Bird x={80} y={20} mood={birdMood} color="#ef7d57" flip />
        </>
      )}
    </g>
  );
}

/* ============ RIVER ============ */
function RiverScene({ state }) {
  const fishMood = state === "negative" ? "worried" : "happy";
  const waterColor = state === "negative" ? "#7d8c6a" : "#29b6f6";
  return (
    <g>
      <Sun x={84} y={12} dim={state === "negative"} />
      <Cloud x={22} y={11} scale={1} dark={state === "negative"} />
      <rect x="0" y="40" width="100" height="8" fill="#8bc34a" />
      {/* water */}
      <motion.rect x="0" y="46" width="100" height="16" animate={{ fill: waterColor }} transition={{ duration: 1 }} />
      {[10, 30, 50, 70, 90].map((x, i) => (
        <motion.path
          key={i}
          d={`M${x - 6} 50 q3 -2 6 0 q3 2 6 0`}
          stroke="#ffffff"
          strokeWidth="0.7"
          fill="none"
          opacity="0.6"
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
      {/* bin */}
      <g transform="translate(74 34)">
        <rect x="0" y="0" width="9" height="11" rx="1" fill="#2e7d32" />
        <rect x="-1" y="-2" width="11" height="2.4" rx="1" fill="#1b5e20" />
        <rect x="3.5" y="-4" width="2" height="2" fill="#1b5e20" />
        <path d="M2 2 v7 M4.5 2 v7 M7 2 v7" stroke="#1b5e20" strokeWidth="0.5" />
      </g>
      {/* child */}
      <PersonSmall x={18} y={45} color="#7c5cff" />
      {/* plastic wrapper */}
      {state === "normal" && (
        <motion.g animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <rect x="24" y="38" width="4" height="2.6" rx="0.6" fill="#ff5252" />
        </motion.g>
      )}
      {state === "negative" && (
        <>
          <rect x="40" y="52" width="4" height="2.6" rx="0.6" fill="#ff5252" opacity="0.9" />
          <rect x="60" y="55" width="3.4" height="2.2" rx="0.6" fill="#ffeb3b" opacity="0.9" />
        </>
      )}
      {/* fish */}
      <motion.g animate={{ x: [0, 12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
        <Fish x={35} y={54} mood={fishMood} color="#ff7043" />
      </motion.g>
      <motion.g animate={{ x: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
        <Fish x={70} y={57} mood={fishMood} color="#ffca28" flip />
      </motion.g>
      {state === "positive" && <FlyingBird y={16} color="#5b8def" dur={12} />}
    </g>
  );
}

function Fish({ x, y, mood = "happy", color = "#ff7043", flip = false }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1}, 1)`}>
      <ellipse cx="0" cy="0" rx="4" ry="2.6" fill={color} />
      <path d="M4 0 L7 -2.4 L7 2.4 Z" fill={color} />
      <circle cx="-2" cy="-0.6" r="0.7" fill="#1e293b" />
      {mood === "happy" ? (
        <path d="M-2.6 1 Q-1.6 2 -0.6 1" stroke="#1e293b" strokeWidth="0.4" fill="none" />
      ) : (
        <path d="M-2.6 1.6 Q-1.6 0.8 -0.6 1.6" stroke="#1e293b" strokeWidth="0.4" fill="none" />
      )}
    </g>
  );
}

/* ============ WATER TAP ============ */
function WaterScene({ state }) {
  const running = state !== "positive";
  return (
    <g>
      <rect x="0" y="0" width="100" height="62" fill="#e3f2fd" />
      <rect x="0" y="44" width="100" height="18" fill="#cfd8dc" />
      <rect x="0" y="44" width="100" height="2" fill="#b0bec5" />
      {/* tiled wall */}
      {[8, 20, 32, 44].map((yy) =>
        [10, 30, 50, 70, 90].map((xx) => (
          <rect key={`${xx}-${yy}`} x={xx - 9} y={yy} width="18" height="12" fill="none" stroke="#bbdefb" strokeWidth="0.4" />
        ))
      )}
      {/* sink */}
      <g transform="translate(40 30)">
        <rect x="-14" y="8" width="28" height="4" rx="2" fill="#eceff1" />
        <path d="M-12 12 h24 l-3 8 h-18 Z" fill="#b0bec5" />
        {/* faucet */}
        <rect x="8" y="-6" width="3" height="10" fill="#90a4ae" />
        <path d="M8 -6 q0 -6 -8 -6" stroke="#90a4ae" strokeWidth="3" fill="none" />
        <circle cx="0" cy="-12" r="2" fill="#78909c" />
      </g>
      {/* running water */}
      {running && (
        <motion.rect
          x="39.6" y="18" width="1.6" height="16" fill="#4fc3f7"
          animate={{ opacity: [0.5, 1, 0.5], scaleY: [1, 1.08, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
      {running &&
        Array.from({ length: 6 }).map((_, i) => (
          <motion.circle
            key={i}
            cx={40 + (i % 2 === 0 ? -2 : 2)}
            r="0.9"
            fill="#4fc3f7"
            initial={{ cy: 34, opacity: 0 }}
            animate={{ cy: 40, opacity: [0, 1, 0], cx: 40 + (Math.random() * 8 - 4) }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      {/* puddle grows when wasted */}
      {state === "negative" && (
        <motion.ellipse
          cx="40" cy="52" fill="#4fc3f7" opacity="0.7"
          initial={{ rx: 6, ry: 1 }}
          animate={{ rx: 26, ry: 3 }}
          transition={{ duration: 2 }}
        />
      )}
      {state === "positive" && (
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <text x="40" y="20" fontSize="7" textAnchor="middle">💧</text>
        </motion.g>
      )}
      {/* water drop character */}
      <WaterDrop x={72} y={40} mood={state === "positive" ? "happy" : state === "negative" ? "worried" : "normal"} />
    </g>
  );
}

function WaterDrop({ x, y, mood }) {
  return (
    <motion.g transform={`translate(${x} ${y})`} animate={{ y: [0, -2, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
      <path d="M0 -10 C 6 -2 6 4 0 6 C -6 4 -6 -2 0 -10 Z" fill="#4fc3f7" />
      <circle cx="-2" cy="-1" r="1" fill="#1e293b" />
      <circle cx="2" cy="-1" r="1" fill="#1e293b" />
      {mood === "happy" ? (
        <path d="M-2.4 2 Q0 4 2.4 2" stroke="#1e293b" strokeWidth="0.6" fill="none" />
      ) : mood === "worried" ? (
        <path d="M-2.4 3 Q0 1.6 2.4 3" stroke="#1e293b" strokeWidth="0.6" fill="none" />
      ) : (
        <line x1="-2" y1="2.6" x2="2" y2="2.6" stroke="#1e293b" strokeWidth="0.6" />
      )}
    </motion.g>
  );
}

/* ============ TREE ============ */
function TreeScene({ state }) {
  const cut = state === "negative";
  return (
    <g>
      <Sun x={84} y={12} dim={cut} />
      <Cloud x={20} y={11} scale={1} dark={cut} />
      <Cloud x={60} y={9} scale={0.8} dark={cut} />
      <rect x="0" y="44" width="100" height="18" fill={cut ? "#c2a878" : "#8bc34a"} />
      <rect x="0" y="44" width="100" height="3" fill={cut ? "#d4bd94" : "#9ccc65"} />
      {/* the big tree */}
      {cut ? (
        <g>
          <rect x="46" y="34" width="8" height="10" fill="#8d6e63" />
          <ellipse cx="50" cy="34" rx="4" ry="1.6" fill="#a1887f" />
          {/* fallen leaves */}
          <circle cx="66" cy="42" r="4" fill="#a5d6a7" opacity="0.6" />
        </g>
      ) : (
        <g>
          <rect x="47" y="30" width="6" height="16" rx="2" fill="#8d6e63" />
          <g className="anim-sway" style={{ transformOrigin: "50px 22px" }}>
            <circle cx="50" cy="20" r="15" fill="#43a047" />
            <circle cx="38" cy="26" r="10" fill="#4caf50" />
            <circle cx="62" cy="26" r="10" fill="#4caf50" />
            <circle cx="50" cy="16" r="10" fill="#66bb6a" />
            <Bird x={46} y={18} mood="happy" color="#5b8def" scale={0.7} />
            <Bird x={56} y={22} mood="happy" color="#ef7d57" scale={0.7} flip />
          </g>
        </g>
      )}
      <Tree x={14} y={46} scale={0.8} bare={cut} />
      <Tree x={88} y={46} scale={0.9} bare={cut} />
      <Bush x={26} y={47} scale={0.9} />
      <Critter x={70} y={49} type="hedgehog" />
      {!cut && <Critter x={30} y={49} type="rabbit" />}
      {/* person with axe (normal) */}
      {state === "normal" && <PersonSmall x={72} y={44} color="#607d8b" />}
      {state === "positive" && (
        <>
          <FlyingBird y={14} color="#5b8def" dur={12} />
          <FlyingBird y={22} color="#ef7d57" dur={15} delay={2} />
        </>
      )}
    </g>
  );
}

/* ============ ROAD ============ */
function RoadScene({ state }) {
  const safe = state !== "negative";
  return (
    <g>
      <rect x="0" y="0" width="100" height="62" fill="#bfe3ff" />
      <Sun x={84} y={12} />
      <Cloud x={22} y={11} scale={1} />
      {/* buildings */}
      <rect x="4" y="20" width="16" height="20" fill="#90a4ae" />
      <rect x="80" y="18" width="16" height="22" fill="#b0bec5" />
      <rect x="7" y="24" width="3" height="3" fill="#fff59d" />
      <rect x="14" y="24" width="3" height="3" fill="#fff59d" />
      <rect x="84" y="22" width="3" height="3" fill="#fff59d" />
      <rect x="90" y="22" width="3" height="3" fill="#fff59d" />
      {/* pavement */}
      <rect x="0" y="40" width="100" height="6" fill="#cfd8dc" />
      {/* road */}
      <rect x="0" y="46" width="100" height="16" fill="#546e7a" />
      {/* zebra crossing */}
      <g>
        {[38, 42, 46, 50, 54, 58].map((x) => (
          <rect key={x} x={x} y="46" width="2.6" height="16" fill="#eceff1" />
        ))}
      </g>
      {/* traffic light */}
      <g transform="translate(66 30)">
        <rect x="-1" y="0" width="2" height="16" fill="#37474f" />
        <rect x="-3" y="-6" width="6" height="9" rx="1.4" fill="#263238" />
        <circle cx="0" cy="-4" r="1.4" fill={safe ? "#ff5252" : "#4b0000"} />
        <circle cx="0" cy="0" r="1.4" fill={safe ? "#66bb6a" : "#0d3b12"} />
      </g>
      {/* car */}
      <motion.g
        animate={safe ? { x: [-30, 130] } : { x: [-30, 40, 40] }}
        transition={{ duration: safe ? 6 : 3, repeat: Infinity, ease: safe ? "linear" : "easeOut" }}
      >
        <Car y={52} />
      </motion.g>
      {/* child crossing */}
      {safe ? (
        <PersonSmall x={48} y={45} color="#e91e63" />
      ) : (
        <motion.g animate={{ x: [18, 52] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <PersonSmall x={0} y={45} color="#e91e63" running />
        </motion.g>
      )}
      {state === "positive" && (
        <motion.text x="48" y="34" fontSize="6" textAnchor="middle"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>👍</motion.text>
      )}
    </g>
  );
}

function Car({ y = 52 }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <rect x="0" y="0" width="16" height="5" rx="2" fill="#ef5350" />
      <rect x="3" y="-3.5" width="9" height="4" rx="1.6" fill="#ef5350" />
      <rect x="4" y="-2.8" width="7" height="2.4" rx="1" fill="#bbdefb" />
      <circle cx="4" cy="5" r="1.8" fill="#263238" />
      <circle cx="12" cy="5" r="1.8" fill="#263238" />
    </g>
  );
}

/* ============ ANIMAL RESCUE ============ */
function AnimalScene({ state }) {
  const rescued = state === "positive";
  return (
    <g>
      <Sun x={84} y={12} />
      <Cloud x={20} y={11} scale={1} />
      <rect x="0" y="44" width="100" height="18" fill="#8bc34a" />
      <rect x="0" y="44" width="100" height="3" fill="#9ccc65" />
      {/* tree */}
      <rect x="47" y="26" width="6" height="20" rx="2" fill="#8d6e63" />
      <circle cx="50" cy="18" r="14" fill="#43a047" />
      <circle cx="38" cy="24" r="9" fill="#4caf50" />
      <circle cx="62" cy="24" r="9" fill="#4caf50" />
      {/* kitten */}
      {rescued ? (
        <motion.g initial={{ y: -6 }} animate={{ y: 0 }}>
          <Kitten x={30} y={41} mood="happy" />
        </motion.g>
      ) : (
        <Kitten x={50} y={24} mood={state === "negative" ? "worried" : "worried"} />
      )}
      {/* adult helper */}
      {rescued ? (
        <PersonSmall x={38} y={44} color="#ff7043" adult />
      ) : state === "negative" ? null : (
        <PersonSmall x={22} y={44} color="#7c5cff" />
      )}
      {rescued && (
        <PersonSmall x={62} y={44} color="#7c5cff" />
      )}
      <Bush x={80} y={48} scale={1} />
      <Critter x={14} y={49} type="rabbit" />
      {rescued && (
        <motion.text x="30" y="30" fontSize="5" textAnchor="middle"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>❤️</motion.text>
      )}
    </g>
  );
}

function Kitten({ x, y, mood }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="0" rx="4" ry="3" fill="#ffb74d" />
      <circle cx="3" cy="-2" r="2.6" fill="#ffb74d" />
      <path d="M1.2 -4 l0.6 -2 l1.2 1.6 Z" fill="#ffb74d" />
      <path d="M4.4 -4 l1.2 -1.6 l0.6 2 Z" fill="#ffb74d" />
      <circle cx="2.4" cy="-2" r="0.5" fill="#1e293b" />
      <circle cx="4" cy="-2" r="0.5" fill="#1e293b" />
      {mood === "happy" ? (
        <path d="M2.4 -0.6 Q3.2 0.2 4 -0.6" stroke="#1e293b" strokeWidth="0.3" fill="none" />
      ) : (
        <path d="M2.6 -0.2 Q3.2 -0.8 3.8 -0.2" stroke="#1e293b" strokeWidth="0.3" fill="none" />
      )}
      <path d="M-4 0 q-3 -1 -3 -3" stroke="#ffb74d" strokeWidth="1.4" fill="none" />
    </g>
  );
}

/* ============ CLASSROOM ============ */
function ClassroomScene({ state }) {
  const messy = state === "negative";
  const clean = state === "positive";
  return (
    <g>
      <rect x="0" y="0" width="100" height="62" fill="#fff3e0" />
      <rect x="0" y="46" width="100" height="16" fill="#d7a86e" />
      <rect x="0" y="46" width="100" height="1.4" fill="#c79461" />
      {/* board */}
      <rect x="8" y="10" width="40" height="22" rx="1.5" fill="#2e7d32" />
      <rect x="6" y="9" width="44" height="24" rx="2" fill="none" stroke="#8d6e63" strokeWidth="2" />
      <path d="M14 20 h10 M14 25 h16" stroke="#fff" strokeWidth="0.8" opacity="0.8" />
      <text x="16" y="17" fontSize="4" fill="#fff" opacity="0.9">ABC</text>
      {/* window */}
      <rect x="60" y="10" width="26" height="18" rx="1.5" fill="#bbdefb" />
      <rect x="60" y="10" width="26" height="18" rx="1.5" fill="none" stroke="#90a4ae" strokeWidth="1.4" />
      <line x1="73" y1="10" x2="73" y2="28" stroke="#90a4ae" strokeWidth="1" />
      <line x1="60" y1="19" x2="86" y2="19" stroke="#90a4ae" strokeWidth="1" />
      <circle cx="79" cy="15" r="2.4" fill="#ffd23f" />
      {/* desk + student */}
      <PersonSmall x={30} y={45} color="#7c5cff" seated />
      <rect x="24" y="42" width="14" height="3" rx="1" fill="#a1887f" />
      <rect x="25" y="45" width="2" height="4" fill="#8d6e63" />
      <rect x="35" y="45" width="2" height="4" fill="#8d6e63" />
      {/* bin */}
      <g transform="translate(78 40)">
        <rect x="0" y="0" width="8" height="10" rx="1" fill="#26a69a" />
        <rect x="-1" y="-2" width="10" height="2" rx="1" fill="#00897b" />
      </g>
      {/* paper */}
      {state === "normal" && (
        <motion.rect x="48" y="54" width="5" height="4" rx="0.6" fill="#fafafa"
          animate={{ rotate: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ transformOrigin: "50px 56px" }} />
      )}
      {messy && (
        <>
          <rect x="42" y="55" width="5" height="4" rx="0.6" fill="#fafafa" transform="rotate(12 44 57)" />
          <rect x="54" y="56" width="4.6" height="3.6" rx="0.6" fill="#f5f5f5" transform="rotate(-14 56 58)" />
          <rect x="66" y="54" width="4.6" height="3.6" rx="0.6" fill="#fafafa" transform="rotate(8 68 56)" />
        </>
      )}
      {clean && (
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <text x="60" y="58" fontSize="6">✨</text>
        </motion.g>
      )}
    </g>
  );
}

/* ============ SHARING ============ */
function SharingScene({ state }) {
  const shared = state === "positive";
  const refused = state === "negative";
  return (
    <g>
      <rect x="0" y="0" width="100" height="62" fill="#fce4ec" />
      <rect x="0" y="46" width="100" height="16" fill="#f8bbd0" />
      {/* table */}
      <rect x="20" y="40" width="60" height="4" rx="1.5" fill="#c79461" />
      <rect x="24" y="44" width="3" height="8" fill="#a1887f" />
      <rect x="73" y="44" width="3" height="8" fill="#a1887f" />
      {/* paper on table */}
      <rect x="42" y="35" width="16" height="6" rx="0.8" fill="#fff" />
      {/* two kids */}
      <PersonSmall x={30} y={40} color="#7c5cff" />
      <PersonSmall x={70} y={40} color="#26c6da" mood={shared ? "happy" : refused ? "sad" : "normal"} />
      {/* crayons */}
      <g transform="translate(32 33)">
        <rect x="0" y="0" width="1.4" height="5" rx="0.6" fill="#ef5350" />
        <rect x="2" y="0" width="1.4" height="5" rx="0.6" fill="#42a5f5" />
        <rect x="4" y="0" width="1.4" height="5" rx="0.6" fill="#66bb6a" />
        <rect x="6" y="0" width="1.4" height="5" rx="0.6" fill="#ffca28" />
      </g>
      {/* shared crayon moves across */}
      {shared && (
        <motion.rect
          width="1.6" height="5" rx="0.6" fill="#ef5350" y="32"
          initial={{ x: 40 }} animate={{ x: 66 }} transition={{ duration: 1, ease: "easeInOut" }}
        />
      )}
      {shared && (
        <motion.text x="50" y="24" fontSize="6" textAnchor="middle"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>🤝</motion.text>
      )}
      {refused && (
        <motion.text x="70" y="30" fontSize="4" textAnchor="middle"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>💧</motion.text>
      )}
    </g>
  );
}

/* ---------- Generic little person ---------- */
function PersonSmall({ x, y, color = "#7c5cff", running = false, adult = false, seated = false, mood = "normal" }) {
  const h = adult ? 1.25 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${h})`}>
      {/* legs */}
      {!seated && (
        <>
          <motion.line
            x1="-1.4" y1="0" x2={running ? "-3" : "-1.4"} y2="4" stroke="#3e2723" strokeWidth="1.4" strokeLinecap="round"
            animate={running ? { x2: [-3, -0.5, -3] } : {}}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
          <line x1="1.4" y1="0" x2="1.4" y2="4" stroke="#3e2723" strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
      {/* body */}
      <rect x="-2.4" y="-6" width="4.8" height="7" rx="2.2" fill={color} />
      {/* arms */}
      <line x1="-2.4" y1="-4" x2="-4.4" y2="-1.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="2.4" y1="-4" x2="4.4" y2="-1.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* head */}
      <circle cx="0" cy="-9" r="3" fill="#ffcc80" />
      <path d="M-3 -10 a3 3 0 0 1 6 0 Z" fill="#5d4037" />
      {/* face */}
      <circle cx="-1" cy="-9" r="0.4" fill="#1e293b" />
      <circle cx="1" cy="-9" r="0.4" fill="#1e293b" />
      {mood === "sad" ? (
        <path d="M-1.2 -7 Q0 -7.8 1.2 -7" stroke="#1e293b" strokeWidth="0.3" fill="none" />
      ) : (
        <path d="M-1.2 -7.6 Q0 -6.8 1.2 -7.6" stroke="#1e293b" strokeWidth="0.3" fill="none" />
      )}
    </g>
  );
}

const SCENES = {
  factory: FactoryScene,
  river: RiverScene,
  water: WaterScene,
  tree: TreeScene,
  road: RoadScene,
  animal: AnimalScene,
  classroom: ClassroomScene,
  sharing: SharingScene,
};

export default function ScenarioScene({ scene, state = "normal", zoom = false }) {
  const SceneComp = SCENES[scene] || FactoryScene;
  return (
    <motion.svg
      viewBox="0 0 100 62"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      animate={{ scale: zoom ? 1.12 : 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <SkyBg state={state} />
      <SceneComp state={state} />
      {/* darken overlay for negative */}
      <motion.rect
        x="0" y="0" width="100" height="62" fill="#1e293b"
        initial={{ opacity: 0 }}
        animate={{ opacity: state === "negative" ? 0.22 : 0 }}
        transition={{ duration: 1 }}
      />
    </motion.svg>
  );
}
