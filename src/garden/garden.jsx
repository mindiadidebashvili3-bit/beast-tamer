import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { RARITY_COLORS } from "../data/data";

// ── Constants ─────────────────────────────────────────────────────────────────

export const GARDEN_W = 440;
export const GARDEN_H = 400;
const PET_SIZE = 52;

// ── Decorations ───────────────────────────────────────────────────────────────

const DECORATIONS = [
  // Trees (corners + sides)
  { id: "tree1",     emoji: "🌳", x: 28,  y: 44,  scale: 1.7, layer: "back"  },
  { id: "tree2",     emoji: "🌲", x: 412, y: 38,  scale: 1.5, layer: "back"  },
  { id: "tree3",     emoji: "🌳", x: 220, y: 30,  scale: 1.3, layer: "back"  },
  // Bushes
  { id: "bush1",     emoji: "🌿", x: 75,  y: 310, scale: 1.2, layer: "front" },
  { id: "bush2",     emoji: "🌿", x: 360, y: 320, scale: 1.3, layer: "front" },
  { id: "bush3",     emoji: "🍀", x: 160, y: 350, scale: 1.0, layer: "front" },
  // Flowers scattered
  { id: "flower1",   emoji: "🌸", x: 190, y: 340, scale: 1.0, layer: "front" },
  { id: "flower2",   emoji: "🌼", x: 110, y: 55,  scale: 0.9, layer: "back"  },
  { id: "flower3",   emoji: "🌺", x: 330, y: 48,  scale: 0.9, layer: "back"  },
  { id: "flower4",   emoji: "🌻", x: 390, y: 290, scale: 1.0, layer: "front" },
  { id: "flower5",   emoji: "💐", x: 50,  y: 240, scale: 0.9, layer: "mid"   },
  // Water features
  { id: "pond",      emoji: "🫧", x: 200, y: 180, scale: 3.2, layer: "mid"   },
  { id: "wave1",     emoji: "💧", x: 178, y: 168, scale: 0.8, layer: "mid"   },
  { id: "wave2",     emoji: "💧", x: 222, y: 190, scale: 0.7, layer: "mid"   },
  // Rocks & mushrooms
  { id: "rock1",     emoji: "🪨", x: 55,  y: 170, scale: 1.2, layer: "mid"   },
  { id: "rock2",     emoji: "🪨", x: 395, y: 200, scale: 1.0, layer: "mid"   },
  { id: "mushroom1", emoji: "🍄", x: 80,  y: 130, scale: 1.0, layer: "mid"   },
  { id: "mushroom2", emoji: "🍄", x: 360, y: 140, scale: 0.85,layer: "mid"   },
  // Ambient sparkles
  { id: "star1",     emoji: "⭐", x: 290, y: 270, scale: 0.75,layer: "front" },
  { id: "star2",     emoji: "✨", x: 145, y: 255, scale: 0.7, layer: "front" },
  { id: "star3",     emoji: "🌟", x: 340, y: 370, scale: 0.65,layer: "front" },
  // Critters
  { id: "butterfly", emoji: "🦋", x: 310, y: 110, scale: 0.9, layer: "mid"   },
  { id: "bird",      emoji: "🐦", x: 130, y: 90,  scale: 0.85,layer: "mid"   },
  { id: "snail",     emoji: "🐌", x: 420, y: 355, scale: 0.8, layer: "front" },
  { id: "ladybug",   emoji: "🐞", x: 25,  y: 360, scale: 0.8, layer: "front" },
];

// zIndex by layer
const LAYER_Z = { back: 2, mid: 6, front: 12 };

// ── Floating particles ────────────────────────────────────────────────────────

function Particle({ x, y, emoji, delay }) {
  return (
    <div style={{
      position: "absolute",
      left: x, top: y,
      fontSize: 12,
      opacity: 0,
      animation: `floatUp 3s ease-out ${delay}s infinite`,
      pointerEvents: "none",
      zIndex: 30,
      userSelect: "none",
    }}>{emoji}</div>
  );
}

const PARTICLES = [
  { x: 60,  y: 300, emoji: "🌸", delay: 0   },
  { x: 200, y: 350, emoji: "✨", delay: 0.8 },
  { x: 350, y: 280, emoji: "🌸", delay: 1.6 },
  { x: 120, y: 200, emoji: "💫", delay: 2.4 },
  { x: 300, y: 320, emoji: "⭐", delay: 3.2 },
  { x: 400, y: 240, emoji: "🌸", delay: 4.0 },
];

// ── useWalker ─────────────────────────────────────────────────────────────────

const IDLE_EMOTES = ["💤", "🎵", "😊", "💫", "❤️", "✨", "😴", "🌟", "🍃", "🎶", "😋", "🥰"];

// Obstacle zones (avoid pond area and tree trunks)
const OBSTACLES = [
  { x: 200, y: 180, r: 38 }, // pond
  { x: 28,  y: 44,  r: 28 }, // tree1
  { x: 412, y: 38,  r: 24 }, // tree2
  { x: 220, y: 30,  r: 20 }, // tree3
];

function isClearTarget(nx, ny) {
  for (const obs of OBSTACLES) {
    const dx = nx - obs.x;
    const dy = ny - obs.y;
    if (Math.sqrt(dx * dx + dy * dy) < obs.r + 28) return false;
  }
  return true;
}

export function useWalker(initX, initY, speed, personality) {
  const [pos, setPos]         = useState({ x: initX, y: initY });
  const [flipped, setFlipped] = useState(false);
  const [bounceY, setBounceY] = useState(0);
  const [emote, setEmote]     = useState(null);
  const [state, setState]     = useState("spawn"); // spawn | walk | idle | play
  const posRef      = useRef({ x: initX, y: initY });
  const targetRef   = useRef({ x: initX, y: initY });
  const frameRef    = useRef(null);
  const bouncePhase = useRef(Math.random() * Math.PI * 2);
  const playPhase   = useRef(0);
  const spawnDone   = useRef(false);

  const pickTarget = useCallback(() => {
    const margin = 60;
    let nx, ny, attempts = 0;
    do {
      nx = margin + Math.random() * (GARDEN_W - margin * 2);
      ny = margin + Math.random() * (GARDEN_H - margin * 2);
      attempts++;
    } while (!isClearTarget(nx, ny) && attempts < 20);
    targetRef.current = { x: nx, y: ny };
    if (nx < posRef.current.x) setFlipped(true);
    else setFlipped(false);
  }, []);

  // Emote timer — personality affects frequency
  useEffect(() => {
    const base = personality === "playful" ? 2500 : personality === "lazy" ? 6000 : 4000;
    const id = setInterval(() => {
      if (Math.random() < (personality === "playful" ? 0.5 : 0.28)) {
        setEmote(IDLE_EMOTES[Math.floor(Math.random() * IDLE_EMOTES.length)]);
        setTimeout(() => setEmote(null), 2000);
      }
    }, base + Math.random() * 2000);
    return () => clearInterval(id);
  }, [personality]);

  // Elastic spawn — hold position for 600ms so CSS spring plays, then walk
  useEffect(() => {
    const t = setTimeout(() => {
      spawnDone.current = true;
      setState("walk");
      pickTarget();
    }, 680);
    return () => clearTimeout(t);
  }, [pickTarget]);

  // Main movement loop
  useEffect(() => {
    let lastTime = null;
    let idleTimer = 0;
    let playTimer = 0;
    let playMode  = false;

    const loop = (ts) => {
      if (lastTime == null) lastTime = ts;
      const dt = Math.min((ts - lastTime) / 1000, 0.08);
      lastTime = ts;

      if (!spawnDone.current) {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      const cur  = posRef.current;
      const tgt  = targetRef.current;
      const dx   = tgt.x - cur.x;
      const dy   = tgt.y - cur.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 5) {
        idleTimer += dt;
        const idleDur = personality === "lazy"    ? 3.5 + Math.random() * 3
                      : personality === "playful" ? 0.6 + Math.random() * 1
                      : 1.5 + Math.random() * 2;

        if (idleTimer > idleDur) {
          idleTimer = 0;
          if (personality === "playful" && Math.random() < 0.25) {
            playMode  = true;
            playTimer = 0;
            setState("play");
          } else {
            playMode = false;
            setState("walk");
            pickTarget();
          }
        }

        if (playMode) {
          playTimer += dt;
          playPhase.current += dt * 8;
          setBounceY(Math.sin(playPhase.current) * 6);
          if (playTimer > 1.2) { playMode = false; setState("walk"); pickTarget(); }
        } else {
          setState("idle");
          bouncePhase.current += dt * 2.5;
          setBounceY(Math.sin(bouncePhase.current) * 2.5);
        }
      } else {
        idleTimer = 0;
        setState("walk");
        const actualSpeed = personality === "lazy"    ? speed * 0.65
                          : personality === "playful" ? speed * 1.2
                          : speed;
        const move = Math.min(actualSpeed * dt, dist);
        const nx   = cur.x + (dx / dist) * move;
        const ny   = cur.y + (dy / dist) * move;
        posRef.current = { x: nx, y: ny };
        setPos({ x: nx, y: ny });
        bouncePhase.current += dt * 11;
        setBounceY(Math.sin(bouncePhase.current) * 4.5);
        if (dx < 0) setFlipped(true);
        else if (dx > 0) setFlipped(false);
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [pickTarget, speed, personality]);

  return { pos, flipped, bounceY, emote, state };
}

// ── Personality by rarity ─────────────────────────────────────────────────────

function getPersonality(rarity) {
  if (rarity === "legendary" || rarity === "epic") return "playful";
  if (rarity === "common") return "lazy";
  return "normal";
}

// ── WalkingPet ────────────────────────────────────────────────────────────────

export function WalkingPet({ beast, initX, initY }) {
  const spd         = 38 + beast.level * 9;
  const personality = getPersonality(beast.rarity);
  const { pos, flipped, bounceY, emote, state } = useWalker(initX, initY, spd, personality);
  const rc = RARITY_COLORS[beast.rarity];

  // Glow intensity by rarity
  const glowSize = beast.rarity === "legendary" ? 18
                 : beast.rarity === "epic"       ? 12
                 : beast.rarity === "rare"       ? 8
                 : 4;

  // Scale pulse when playing
  const playScale = state === "play" ? 1.18 : 1;

  // ── Dynamic ground shadow: scales with bounceY (higher = smaller/softer) ──
  const shadowOffsetNorm = bounceY / 4.5;            // –1 … +1
  const shadowScaleX     = state === "walk"
    ? 0.85 + shadowOffsetNorm * -0.15               // compress when airborne
    : 0.68 + shadowOffsetNorm * -0.12;
  const shadowOpacity    = 0.18 - Math.abs(shadowOffsetNorm) * 0.07;
  const shadowBlur       = 2 + Math.abs(bounceY) * 0.4;

  // ── Elastic drop entrance ──────────────────────────────────────────────────
  const isSpawn = state === "spawn";

  return (
    <div style={{
      position:   "absolute",
      left:       pos.x - PET_SIZE / 2,
      top:        pos.y - PET_SIZE / 2 + bounceY,
      width:      PET_SIZE,
      userSelect: "none",
      pointerEvents: "none",
      zIndex:     15,
      transition: "left 0.06s linear, top 0.06s linear",
      // Elastic spring entrance — from scale(0) to overshoot 1.22 → settle 1
      animation:  isSpawn ? "petSpawnDrop 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards" : "none",
    }}>
      {/* Rarity glow ring */}
      <div style={{
        position:     "absolute",
        inset:        -glowSize / 2,
        borderRadius: "50%",
        background:   `radial-gradient(circle, ${rc}44 0%, transparent 70%)`,
        pointerEvents: "none",
        zIndex:       0,
        animation:    beast.rarity === "legendary" ? "legendPulse 2s ease-in-out infinite"
                    : beast.rarity === "epic"       ? "epicPulse 2.5s ease-in-out infinite"
                    : "none",
      }} />

      {/* Emote bubble */}
      {emote && (
        <div style={{
          position:  "absolute",
          top:       -34,
          left:      "50%",
          transform: "translateX(-50%)",
          background: "#fff",
          border:     `2px solid ${rc}`,
          borderRadius: 20,
          padding:    "3px 8px",
          fontSize:   15,
          boxShadow:  `0 3px 12px ${rc}55`,
          animation:  "pop 0.3s ease",
          zIndex:     25,
          whiteSpace: "nowrap",
        }}>{emote}</div>
      )}

      {/* Dynamic ground shadow — scales inversely with bounceY height */}
      <div style={{
        position:     "absolute",
        bottom:       -6,
        left:         "50%",
        transform:    `translateX(-50%) scaleX(${shadowScaleX})`,
        width:        state === "walk" ? 30 : 24,
        height:       7,
        background:   `rgba(0,0,0,${shadowOpacity})`,
        borderRadius: "50%",
        filter:       `blur(${shadowBlur}px)`,
        transition:   "width 0.2s",
      }} />

      {/* Pet emoji */}
      <div style={{
        fontSize:   34,
        textAlign:  "center",
        transform:  `scaleX(${flipped ? -1 : 1}) scale(${playScale})`,
        filter:     `drop-shadow(0 3px 6px ${beast.color}aa)`,
        lineHeight: 1,
        transition: "transform 0.15s ease",
        zIndex:     1,
        position:   "relative",
      }}>{beast.emoji}</div>

      {/* Name tag */}
      <div style={{
        textAlign:    "center",
        fontSize:     8,
        fontWeight:   800,
        color:        "#1e1b4b",
        marginTop:    3,
        background:   `${beast.color}dd`,
        borderRadius: 20,
        padding:      "1px 6px",
        border:       `1.5px solid ${rc}77`,
        whiteSpace:   "nowrap",
        overflow:     "hidden",
        textOverflow: "ellipsis",
        maxWidth:     PET_SIZE,
        boxShadow:    `0 1px 4px ${rc}44`,
        letterSpacing: 0.3,
      }}>{beast.name}</div>
    </div>
  );
}

// ── Time of Day ───────────────────────────────────────────────────────────────

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 6  && h < 12) return "morning";
  if (h >= 12 && h < 17) return "day";
  if (h >= 17 && h < 20) return "evening";
  return "night";
}

// Time-aware environment config — each period has its own atmospheric fingerprint
const TIME_STYLES = {
  morning: {
    sky:          "linear-gradient(180deg, #fed7aa 0%, #fef3c7 40%, #d1fae5 100%)",
    label:        "🌅 Morning",
    // Warm golden-hour sun rays radiating from upper-left
    vignette:     "radial-gradient(ellipse 110% 60% at 0% 0%, rgba(254,215,170,0.55) 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(0,0,0,0.22) 0%, transparent 60%)",
    glowAccent:   "rgba(251,191,36,0.30)",
    glowPos:      "18% 0%",
    glowSize:     "70% 55%",
    particleExtra: [
      { x: 20,  y: 80,  emoji: "🌤️", delay: 0.3  },
      { x: 320, y: 60,  emoji: "☀️",  delay: 1.5  },
    ],
  },
  day: {
    sky:          "linear-gradient(180deg, #bae6fd 0%, #d1fae5 45%, #a7f3d0 100%)",
    label:        "☀️ Daytime",
    // Bright midday — soft top vignette, richer depth at the bottom
    vignette:     "radial-gradient(ellipse at 50% 0%, rgba(186,230,253,0.4) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.18) 0%, transparent 55%)",
    glowAccent:   "rgba(134,239,172,0.25)",
    glowPos:      "50% 0%",
    glowSize:     "100% 40%",
    particleExtra: [
      { x: 260, y: 50, emoji: "☁️", delay: 1.2 },
    ],
  },
  evening: {
    sky:          "linear-gradient(180deg, #fda4af 0%, #fcd34d 35%, #d1fae5 100%)",
    label:        "🌇 Evening",
    // Warm amber sunset flooding from the right, purple dusk on the left
    vignette:     "radial-gradient(ellipse 90% 70% at 100% 0%, rgba(253,164,175,0.60) 0%, transparent 55%), radial-gradient(ellipse 60% 60% at 0% 100%, rgba(88,28,135,0.20) 0%, transparent 60%)",
    glowAccent:   "rgba(251,146,60,0.35)",
    glowPos:      "85% 0%",
    glowSize:     "55% 60%",
    particleExtra: [
      { x: 50,  y: 70,  emoji: "🌆", delay: 0.7 },
      { x: 370, y: 40,  emoji: "🌅", delay: 2.1 },
    ],
  },
  night: {
    sky:          "linear-gradient(180deg, #1e1b4b 0%, #312e81 40%, #3730a3 70%, #4338ca 100%)",
    label:        "🌙 Night",
    // Deep moonlit darkness — cool blue perimeter, subtle centre luminance
    vignette:     "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.50) 0%, transparent 60%), radial-gradient(ellipse at 0% 0%, rgba(0,0,0,0.35) 0%, transparent 50%), radial-gradient(ellipse at 100% 0%, rgba(0,0,0,0.35) 0%, transparent 50%)",
    glowAccent:   "rgba(165,180,252,0.18)",
    glowPos:      "75% 8%",
    glowSize:     "40% 40%",
    particleExtra: [
      { x: 80,  y: 40, emoji: "🌙", delay: 0   },
      { x: 340, y: 30, emoji: "💫", delay: 1.8 },
    ],
  },
};

// ── PetGarden ─────────────────────────────────────────────────────────────────

export function PetGarden({ collection }) {
  const [time, setTime]           = useState(getTimeOfDay());
  const [manualTime, setManualTime] = useState(null);
  const activeTime = manualTime || time;
  const ts         = TIME_STYLES[activeTime];
  const isNight    = activeTime === "night";

  // Refresh time every minute
  useEffect(() => {
    const id = setInterval(() => setTime(getTimeOfDay()), 60_000);
    return () => clearInterval(id);
  }, []);

  const initialPositions = useMemo(() => {
    return collection.map((_, i) => {
      const cols = Math.ceil(Math.sqrt(collection.length));
      const col  = i % cols;
      const row  = Math.floor(i / cols);
      const x    = 90 + col * ((GARDEN_W - 180) / Math.max(cols - 1, 1));
      const y    = 120 + row * 90;
      let nx, ny, attempts = 0;
      do {
        nx = Math.max(60, Math.min(GARDEN_W - 60, x + (Math.random() - 0.5) * 50));
        ny = Math.max(70, Math.min(GARDEN_H - 60, y + (Math.random() - 0.5) * 40));
        attempts++;
      } while (!isClearTarget(nx, ny) && attempts < 15);
      return { x: nx, y: ny };
    });
  }, [collection.length]); // eslint-disable-line

  if (collection.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: 72 }}>🌱</div>
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20, color: "#94a3b8", marginTop: 14 }}>
          Your garden is empty!
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>
          Tame some beasts and they'll roam freely here 🐾
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "#4338ca" }}>
            🌿 Pet Garden
          </div>
          <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>
            {collection.length} beast{collection.length !== 1 ? "s" : ""} roaming freely ✨
          </p>
        </div>
        <div style={{ fontSize: 12, color: "#818cf8", fontWeight: 700 }}>{ts.label}</div>
      </div>

      {/* Time toggle pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {Object.entries(TIME_STYLES).map(([key, val]) => (
          <button key={key} onClick={() => setManualTime(manualTime === key ? null : key)} style={{
            border: "none", borderRadius: 50,
            padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
            background: activeTime === key ? "#818cf8" : "#f1f5f9",
            color: activeTime === key ? "#fff" : "#64748b",
            transition: "all 0.2s",
          }}>{val.label}</button>
        ))}
      </div>

      {/* Garden canvas */}
      <div style={{
        position:     "relative",
        width:        "100%",
        maxWidth:     GARDEN_W,
        height:       GARDEN_H,
        margin:       "0 auto",
        borderRadius: 28,
        overflow:     "hidden",
        background:   ts.sky,
        border:       isNight ? "3px solid #4338ca88" : "3px solid #6ee7b780",
        boxShadow:    isNight
          ? "0 8px 40px rgba(67,56,202,0.35), inset 0 0 60px rgba(0,0,0,0.2)"
          : "0 8px 40px rgba(16,185,129,0.18), inset 0 0 40px rgba(255,255,255,0.2)",
      }}>

        {/* Night stars */}
        {isNight && [
          [40,20],[100,15],[160,8],[240,25],[310,12],[380,22],[420,8],
          [70,55],[200,45],[350,50],[160,38],[280,30],
        ].map(([sx, sy], i) => (
          <div key={i} style={{
            position:     "absolute", left: sx, top: sy,
            width: 2,     height: 2,
            background:   "#fff",
            borderRadius: "50%",
            animation:    `twinkle ${1.5 + Math.random()}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            opacity: 0.8,
          }} />
        ))}

        {/* Ground layer */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "52%",
          background: isNight
            ? "linear-gradient(180deg, #1e3a1e 0%, #14521e 100%)"
            : "linear-gradient(180deg, #86efac 0%, #4ade80 100%)",
          borderRadius: "60% 60% 0 0 / 20px 20px 0 0",
          zIndex: 1,
        }} />

        {/* Grass texture */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 2,
          backgroundImage: isNight
            ? "repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.02) 30px, rgba(255,255,255,0.02) 31px)"
            : "repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.07) 30px, rgba(255,255,255,0.07) 31px)",
          pointerEvents: "none",
        }} />

        {/* ── Ambient light glow — time-aware colour + position ───────────── */}
        <div style={{
          position:      "absolute", inset: 0, zIndex: 3,
          background:    `radial-gradient(ellipse ${ts.glowSize} at ${ts.glowPos}, ${ts.glowAccent} 0%, transparent 100%)`,
          pointerEvents: "none",
          transition:    "background 1.2s ease",
        }} />

        {/* ── Atmospheric vignette — time-aware depth overlay ─────────────── */}
        <div style={{
          position:      "absolute", inset: 0, zIndex: 4,
          background:    ts.vignette,
          pointerEvents: "none",
          transition:    "background 1.2s ease",
          mixBlendMode:  "multiply",
        }} />

        {/* Extra inner vignette frame — universal cinematic edge darkening */}
        <div style={{
          position:      "absolute", inset: 0, zIndex: 5,
          background:    "radial-gradient(ellipse 90% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.18) 100%)",
          pointerEvents: "none",
          borderRadius:  26,
        }} />

        {/* Floating particles */}
        {PARTICLES.map((p, i) => (
          <Particle key={i} {...p} />
        ))}

        {/* Time-aware extra ambient particles */}
        {ts.particleExtra?.map((p, i) => (
          <Particle key={`te${i}`} {...p} />
        ))}

        {/* Back-layer decorations */}
        {DECORATIONS.filter(d => d.layer === "back").map(d => (
          <div key={d.id} style={{
            position:  "absolute", left: d.x, top: d.y,
            fontSize:  20 * d.scale,
            transform: "translate(-50%, -50%)",
            userSelect: "none", pointerEvents: "none",
            zIndex:    LAYER_Z.back,
            filter:    isNight
              ? `drop-shadow(0 0 6px rgba(165,180,252,0.4)) brightness(0.7)`
              : "drop-shadow(0 3px 4px rgba(0,0,0,0.12))",
          }}>{d.emoji}</div>
        ))}

        {/* Mid-layer decorations */}
        {DECORATIONS.filter(d => d.layer === "mid").map(d => (
          <div key={d.id} style={{
            position:  "absolute", left: d.x, top: d.y,
            fontSize:  20 * d.scale,
            transform: "translate(-50%, -50%)",
            userSelect: "none", pointerEvents: "none",
            zIndex:    LAYER_Z.mid,
            filter:    isNight
              ? "drop-shadow(0 0 4px rgba(165,180,252,0.3)) brightness(0.75)"
              : "drop-shadow(0 2px 3px rgba(0,0,0,0.10))",
          }}>{d.emoji}</div>
        ))}

        {/* Walking beasts */}
        {collection.map((beast, i) => (
          <WalkingPet
            key={beast.id}
            beast={beast}
            initX={initialPositions[i]?.x ?? 120 + i * 40}
            initY={initialPositions[i]?.y ?? 200}
          />
        ))}

        {/* Front-layer decorations (render over pets) */}
        {DECORATIONS.filter(d => d.layer === "front").map(d => (
          <div key={d.id} style={{
            position:  "absolute", left: d.x, top: d.y,
            fontSize:  20 * d.scale,
            transform: "translate(-50%, -50%)",
            userSelect: "none", pointerEvents: "none",
            zIndex:    LAYER_Z.front,
            filter:    isNight
              ? "drop-shadow(0 0 4px rgba(165,180,252,0.3)) brightness(0.75)"
              : "drop-shadow(0 2px 3px rgba(0,0,0,0.10))",
          }}>{d.emoji}</div>
        ))}

        {/* Night moon */}
        {isNight && (
          <div style={{
            position: "absolute", top: 16, right: 28, fontSize: 32,
            filter:   "drop-shadow(0 0 12px rgba(255,255,255,0.6))",
            zIndex:   4, animation: "floatUpDown 4s ease-in-out infinite",
          }}>🌕</div>
        )}

        {/* Morning sun */}
        {activeTime === "morning" && (
          <div style={{
            position: "absolute", top: 18, left: 22, fontSize: 28,
            filter:   "drop-shadow(0 0 14px rgba(251,191,36,0.85))",
            zIndex:   4, animation: "floatUpDown 6s ease-in-out infinite",
          }}>🌄</div>
        )}

        {/* Day sun */}
        {activeTime === "day" && (
          <div style={{
            position: "absolute", top: 14, right: 26, fontSize: 30,
            filter:   "drop-shadow(0 0 10px rgba(251,191,36,0.6))",
            zIndex:   4, animation: "floatUpDown 5s ease-in-out infinite",
          }}>☀️</div>
        )}

        {/* Evening sunset glow strip */}
        {activeTime === "evening" && (
          <>
            <div style={{
              position: "absolute", top: 12, right: 24, fontSize: 28,
              filter:   "drop-shadow(0 0 16px rgba(253,164,175,0.9))",
              zIndex:   4, animation: "floatUpDown 4.5s ease-in-out infinite",
            }}>🌇</div>
            {/* Horizon glow bar */}
            <div style={{
              position:   "absolute", bottom: "47%", left: 0, right: 0, height: 18,
              background: "linear-gradient(90deg, transparent 0%, rgba(253,186,116,0.45) 30%, rgba(251,146,60,0.55) 50%, rgba(253,186,116,0.45) 70%, transparent 100%)",
              filter:     "blur(6px)",
              zIndex:     3,
              pointerEvents: "none",
            }} />
          </>
        )}
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes floatUp {
          0%   { opacity: 0; transform: translateY(0px) scale(0.8); }
          20%  { opacity: 0.9; }
          80%  { opacity: 0.6; }
          100% { opacity: 0; transform: translateY(-55px) scale(1.1); }
        }
        @keyframes legendPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 0.9; transform: scale(1.15); }
        }
        @keyframes epicPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%       { opacity: 0.75; transform: scale(1.1); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.8); }
        }
        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        /* Elastic spring drop entrance for beasts spawning into the garden */
        @keyframes petSpawnDrop {
          0%   { transform: scale(0) translateY(-20px); opacity: 0; }
          45%  { transform: scale(1.22) translateY(0px); opacity: 1; }
          65%  { transform: scale(0.91) translateY(0px); opacity: 1; }
          80%  { transform: scale(1.07) translateY(0px); opacity: 1; }
          92%  { transform: scale(0.97) translateY(0px); opacity: 1; }
          100% { transform: scale(1)    translateY(0px); opacity: 1; }
        }
      `}</style>

      {/* Beast roster pills */}
      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center" }}>
        {collection.map(beast => {
          const rc = RARITY_COLORS[beast.rarity];
          return (
            <div key={beast.id} style={{
              display: "flex", alignItems: "center", gap: 5,
              background: `${beast.color}33`,
              border:     `1.5px solid ${rc}66`,
              borderRadius: 50,
              padding: "5px 12px",
              fontSize:   12,
              fontWeight: 700,
              color:      "#1e1b4b",
              boxShadow:  `0 2px 8px ${beast.color}33`,
            }}>
              <span>{beast.emoji}</span>
              <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 11 }}>{beast.name}</span>
              <span style={{
                fontSize: 9, color: rc, fontWeight: 800,
                textTransform: "uppercase", letterSpacing: 0.5,
              }}>{beast.rarity}</span>
              <span style={{ fontSize: 10, color: "#818cf8" }}>Lv.{beast.level}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── GardenView ────────────────────────────────────────────────────────────────

export default function GardenView({ game }) {
  return (
    <div style={{ padding: "16px 16px 90px", minHeight: "100dvh", boxSizing: "border-box" }}>
      <PetGarden collection={game.collection} />
    </div>
  );
}
