import { motion } from "framer-motion";

/* ---------- Sun ---------- */
export function Sun({ x = 82, y = 16, dim = false }) {
  return (
    <g style={{ transition: "opacity 1s" }} opacity={dim ? 0.4 : 1}>
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{ originX: `${x}px`, originY: `${y}px` }}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={x + Math.cos(a) * 8}
              y1={y + Math.sin(a) * 8}
              x2={x + Math.cos(a) * 13}
              y2={y + Math.sin(a) * 13}
              stroke="#ffd23f"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          );
        })}
      </motion.g>
      <circle cx={x} cy={y} r="7.5" fill="#ffd23f" />
      <circle cx={x} cy={y} r="7.5" fill="#ffe27a" opacity="0.6" />
    </g>
  );
}

/* ---------- Cloud (SVG) ---------- */
export function Cloud({ x = 20, y = 14, scale = 1, dark = false }) {
  const fill = dark ? "#9aa4b2" : "#ffffff";
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={dark ? 0.9 : 0.95}>
      <ellipse cx="0" cy="0" rx="9" ry="6" fill={fill} />
      <ellipse cx="8" cy="1.5" rx="7" ry="5" fill={fill} />
      <ellipse cx="-8" cy="2" rx="6.5" ry="4.5" fill={fill} />
      <ellipse cx="0" cy="3" rx="12" ry="4" fill={fill} />
    </g>
  );
}

/* ---------- Drifting clouds layer (HTML for perf) ---------- */
export function DriftingClouds({ dark = false }) {
  const clouds = [
    { top: "8%", size: 90, dur: 60, delay: 0 },
    { top: "18%", size: 60, dur: 85, delay: -30 },
    { top: "5%", size: 120, dur: 100, delay: -60 },
    { top: "26%", size: 70, dur: 75, delay: -15 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {clouds.map((c, i) => (
        <div
          key={i}
          className="cloud-drift absolute"
          style={{
            top: c.top,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
          }}
        >
          <svg width={c.size} height={c.size * 0.55} viewBox="-24 -12 48 26">
            <Cloud x={0} y={0} scale={1.6} dark={dark} />
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ---------- Bird with expression states ---------- */
// mood: happy | normal | worried | coughing
export function Bird({ x = 30, y = 30, mood = "normal", color = "#5b8def", scale = 1, flip = false }) {
  const flap = {
    animate: { rotate: [0, -22, 0, -22, 0] },
    transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
  };
  const eyeY = mood === "worried" || mood === "coughing" ? -2 : -2.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -scale : scale)}, ${scale})`}>
      {/* body */}
      <ellipse cx="0" cy="0" rx="7" ry="5.5" fill={color} />
      <ellipse cx="0" cy="1" rx="4.5" ry="3.5" fill="#ffffff" opacity="0.85" />
      {/* head */}
      <circle cx="5" cy="-4" r="4.2" fill={color} />
      {/* beak */}
      <path d="M9 -4 L13 -3 L9 -1.5 Z" fill="#ff9f1c" />
      {/* wing flap */}
      <motion.path d="M-1 -1 Q-8 -6 -12 -2 Q-8 1 -1 1 Z" fill={color} {...flap}
        style={{ originX: "-1px", originY: "-1px" }} />
      {/* eye */}
      <circle cx="6" cy={eyeY} r="1.1" fill="#1e293b" />
      {/* mood extras */}
      {mood === "happy" && (
        <path d="M4.6 -2.2 Q5.6 -0.9 6.8 -2" stroke="#1e293b" strokeWidth="0.5" fill="none" />
      )}
      {mood === "worried" && (
        <path d="M3.6 -6.4 L6 -5.6" stroke="#1e293b" strokeWidth="0.6" strokeLinecap="round" />
      )}
      {mood === "coughing" && (
        <>
          <circle cx="12" cy="-6" r="1.6" fill="#94a3b8" opacity="0.7" />
          <circle cx="14.5" cy="-8" r="1.1" fill="#94a3b8" opacity="0.5" />
        </>
      )}
      {/* legs */}
      <line x1="-1" y1="5" x2="-1" y2="8" stroke="#ff9f1c" strokeWidth="0.9" />
      <line x1="2" y1="5" x2="2" y2="8" stroke="#ff9f1c" strokeWidth="0.9" />
    </g>
  );
}

/* ---------- Flying bird that crosses screen ---------- */
export function FlyingBird({ y = 20, color = "#5b8def", dur = 14, delay = 0, mood = "happy" }) {
  return (
    <motion.g
      initial={{ x: -20 }}
      animate={{ x: 130, y: [0, -6, 0, -6, 0] }}
      transition={{
        x: { duration: dur, repeat: Infinity, ease: "linear", delay },
        y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <Bird x={0} y={y} mood={mood} color={color} scale={0.8} />
    </motion.g>
  );
}

/* ---------- Tree ---------- */
export function Tree({ x = 20, y = 70, scale = 1, bare = false, sway = true }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-2.4" y="-2" width="4.8" height="16" rx="2" fill="#8b5a2b" />
      <g className={sway ? "anim-sway" : ""} style={{ transformOrigin: "0px -6px" }}>
        {bare ? (
          <>
            <line x1="0" y1="-2" x2="-6" y2="-14" stroke="#8b5a2b" strokeWidth="2" strokeLinecap="round" />
            <line x1="0" y1="-4" x2="6" y2="-16" stroke="#8b5a2b" strokeWidth="2" strokeLinecap="round" />
            <line x1="0" y1="-6" x2="0" y2="-18" stroke="#8b5a2b" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="0" cy="-14" r="11" fill="#43a047" />
            <circle cx="-8" cy="-8" r="8" fill="#4caf50" />
            <circle cx="8" cy="-8" r="8" fill="#4caf50" />
            <circle cx="0" cy="-16" r="7" fill="#66bb6a" />
          </>
        )}
      </g>
    </g>
  );
}

/* ---------- Bush ---------- */
export function Bush({ x = 30, y = 82, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="-5" cy="0" rx="6" ry="5" fill="#4caf50" />
      <ellipse cx="5" cy="0" rx="6" ry="5" fill="#43a047" />
      <ellipse cx="0" cy="-3" rx="7" ry="6" fill="#66bb6a" />
    </g>
  );
}

/* ---------- Little animal (rabbit/hedgehog) ---------- */
export function Critter({ x = 40, y = 88, type = "rabbit", color = "#f9a8d4" }) {
  return (
    <motion.g
      transform={`translate(${x} ${y})`}
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    >
      {type === "rabbit" && (
        <>
          <ellipse cx="0" cy="0" rx="4" ry="3.4" fill={color} />
          <circle cx="2.6" cy="-2" r="2.4" fill={color} />
          <ellipse cx="1.8" cy="-5" rx="0.8" ry="2.4" fill={color} />
          <ellipse cx="3.4" cy="-5" rx="0.8" ry="2.4" fill={color} />
          <circle cx="3.4" cy="-2.2" r="0.5" fill="#1e293b" />
          <circle cx="-3.6" cy="0" r="1.4" fill="#fff" />
        </>
      )}
      {type === "hedgehog" && (
        <>
          <ellipse cx="0" cy="0" rx="4.4" ry="3" fill="#8b5a2b" />
          <path d="M-4 -2 L-3 -4 M-2 -2.6 L-1 -4.6 M0 -2.8 L1 -4.8 M2 -2.4 L3 -4.2"
            stroke="#5d4037" strokeWidth="0.7" strokeLinecap="round" />
          <circle cx="4" cy="0.4" r="1.8" fill="#c69c6d" />
          <circle cx="4.6" cy="0" r="0.4" fill="#1e293b" />
        </>
      )}
    </motion.g>
  );
}

/* ---------- Sparkle particles ---------- */
export function Sparkles({ show }) {
  if (!show) return null;
  const items = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((_, i) => {
        const left = 10 + Math.random() * 80;
        const delay = Math.random() * 0.8;
        const size = 10 + Math.random() * 18;
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${left}%`, bottom: "10%", fontSize: size }}
            initial={{ y: 0, opacity: 0, scale: 0.4 }}
            animate={{ y: -220 - Math.random() * 120, opacity: [0, 1, 0], scale: 1, rotate: 180 }}
            transition={{ duration: 1.8 + Math.random(), delay, ease: "easeOut" }}
          >
            {["✨", "⭐", "🌟", "💫"][i % 4]}
          </motion.div>
        );
      })}
    </div>
  );
}
