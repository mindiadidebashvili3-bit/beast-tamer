import { useState } from "react";
import { RARITY_COLORS, RARITY_GLOW, XP_PER_LEVEL } from "../data/data";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  fontDisplay: "'Fredoka One', cursive",
  fontBody:    "'Nunito', sans-serif",
  inkDark:     "#2d2250",
  inkMid:      "#64748b",
  inkFaint:    "#a09ec0",
  cream:       "#faf8ff",
  surface:     "#ffffff",
  lavender:    "#ede9fe",
  lilac:       "#c4b5fd",
  violet:      "#818cf8",
  blush:       "#fce7f3",
  mint:        "#d1fae5",
};

const RARITY_CONFIG = {
  common:    { label: "Common",    bg: "#f8fafc" },
  uncommon:  { label: "Uncommon",  bg: "#f0fdf4" },
  rare:      { label: "Rare",      bg: "#eff6ff" },
  epic:      { label: "Epic",      bg: "#faf5ff" },
  legendary: { label: "Legendary", bg: "#fffbeb" },
};

// ── PressBox — wraps any element with mobile-native press feedback ─────────────
// Replaces hover with onTouchStart/onTouchEnd + onClick for proper mobile feel.
export function PressBox({ onPress, style, children, scale = 0.94, disabled = false }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onTouchStart={() => !disabled && setPressed(true)}
      onTouchEnd={() => { setPressed(false); }}
      onTouchCancel={() => setPressed(false)}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={disabled ? undefined : onPress}
      style={{
        ...style,
        transform: pressed ? `scale(${scale})` : "scale(1)",
        transition: pressed
          ? "transform 0.08s ease-out"
          : "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        WebkitTapHighlightColor: "transparent",
        cursor: disabled ? "default" : "pointer",
        userSelect: "none",
      }}
    >
      {children}
    </div>
  );
}

// ── BeastCard ─────────────────────────────────────────────────────────────────
// small={true}  → compact 2-col grid tile
// default       → full card with tap-to-flip for ability detail

export function BeastCard({ beast, owned = false, small = false }) {
  const [flipped, setFlipped] = useState(false);

  const rc   = RARITY_COLORS[beast.rarity] ?? "#94a3b8";
  const glow = RARITY_GLOW[beast.rarity]   ?? "rgba(148,163,184,0.2)";
  const cfg  = RARITY_CONFIG[beast.rarity] ?? RARITY_CONFIG.common;
  const isLeg  = beast.rarity === "legendary";
  const isEpic = beast.rarity === "epic";

  // ── Small tile ─────────────────────────────────────────────────────────────
  if (small) {
    return (
      <PressBox scale={0.93} style={{
        background: cfg.bg,
        border: `2px solid ${rc}44`,
        borderRadius: 16,
        padding: "12px 8px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        position: "relative",
        minWidth: 0,
        // min 44×44 touch target
        minHeight: 96,
        justifyContent: "center",
      }}>
        {/* Rarity pip */}
        <div style={{
          position: "absolute", top: 7, left: 7,
          width: 8, height: 8, borderRadius: "50%",
          background: rc,
          boxShadow: `0 0 5px ${rc}`,
        }} />
        {owned && (
          <div style={{
            position: "absolute", top: 5, right: 6,
            fontSize: 13, lineHeight: 1,
          }}>✅</div>
        )}
        <div style={{ fontSize: 30, lineHeight: 1 }}>{beast.emoji}</div>
        <div style={{
          fontFamily: T.fontDisplay, fontSize: 12,
          color: T.inkDark, textAlign: "center", lineHeight: 1.2,
        }}>{beast.name}</div>
        <div style={{
          fontSize: 10, fontWeight: 900, color: rc,
          textTransform: "uppercase", letterSpacing: 0.8,
        }}>Lv.{beast.level}</div>
      </PressBox>
    );
  }

  // ── Full card — flip on tap ────────────────────────────────────────────────
  return (
    <PressBox
      onPress={() => setFlipped(f => !f)}
      scale={0.96}
      style={{
        perspective: 900,
        minWidth: 130,
        // flexible height so content never clips on small phones
        minHeight: 190,
        position: "relative",
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        transformStyle: "preserve-3d",
        transition: "transform 0.5s cubic-bezier(0.4,0.2,0.2,1)",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}>

        {/* ── FRONT ── */}
        <div style={{
          position: "absolute", inset: 0,
          backfaceVisibility: "hidden",
          background: cfg.bg,
          border: `2px solid ${rc}55`,
          borderRadius: 20,
          boxShadow: isLeg
            ? `0 0 0 1.5px ${rc}77, 0 6px 28px ${glow}`
            : `0 4px 18px ${glow}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          padding: "14px 10px 20px",
          overflow: "hidden",
        }}>
          {/* Animated shimmer ribbon */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 5,
            background: isLeg
              ? `linear-gradient(90deg, ${rc}, #f472b6, ${rc})`
              : isEpic
                ? `linear-gradient(90deg, #c084fc, #818cf8, #c084fc)`
                : rc,
            backgroundSize: isLeg || isEpic ? "200% 100%" : "100%",
            animation: isLeg || isEpic ? "shimmerBar 2.5s linear infinite" : "none",
            borderRadius: "18px 18px 0 0",
          }} />

          {/* Soft glow halo behind emoji */}
          <div style={{
            position: "absolute",
            width: 90, height: 90, borderRadius: "50%",
            background: `radial-gradient(circle, ${rc}25 0%, transparent 70%)`,
            top: "40%", left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }} />

          {owned && (
            <div style={{
              position: "absolute", top: 10, right: 10,
              background: "#fff", borderRadius: "50%",
              width: 24, height: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, boxShadow: "0 1px 5px rgba(0,0,0,0.15)",
            }}>✅</div>
          )}

          <div style={{
            fontSize: 46, lineHeight: 1,
            filter: `drop-shadow(0 4px 10px ${glow})`,
            animation: isLeg ? "float 3s ease-in-out infinite" : undefined,
          }}>{beast.emoji}</div>

          <div style={{
            fontFamily: T.fontDisplay, fontSize: 15,
            color: T.inkDark, textAlign: "center", lineHeight: 1.2,
          }}>{beast.name}</div>

          {beast.role && (
            <div style={{
              fontSize: 10, color: T.violet, fontWeight: 800,
              fontStyle: "italic", textAlign: "center",
            }}>{beast.role}</div>
          )}

          <div style={{
            background: `${rc}18`, border: `1px solid ${rc}55`,
            borderRadius: 20, padding: "3px 10px",
            fontSize: 10, fontWeight: 900, color: rc,
            textTransform: "uppercase", letterSpacing: 1,
          }}>{cfg.label}</div>

          <div style={{ fontSize: 11, color: T.inkFaint }}>Lv.{beast.level}</div>

          {/* Hint at bottom — tap-safe zone */}
          <div style={{
            position: "absolute", bottom: 6,
            fontSize: 10, color: T.inkFaint, letterSpacing: 0.2,
          }}>tap for ability ✨</div>
        </div>

        {/* ── BACK ── */}
        <div style={{
          position: "absolute", inset: 0,
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          background: `linear-gradient(150deg, ${cfg.bg}, #fff)`,
          border: `2px solid ${rc}55`,
          borderRadius: 20,
          boxShadow: `0 4px 18px ${glow}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
          padding: "16px 14px",
          overflow: "hidden",
          textAlign: "center",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: rc, borderRadius: "18px 18px 0 0" }} />

          <div style={{ fontSize: 30 }}>{beast.emoji}</div>

          {beast.ability ? (
            <>
              <div style={{
                background: `${rc}18`, border: `1px solid ${rc}44`,
                borderRadius: 12, padding: "5px 12px",
                fontSize: 12, fontWeight: 900, color: rc,
              }}>⚡ {beast.ability}</div>
              <div style={{ fontSize: 12, color: T.inkMid, lineHeight: 1.55, padding: "0 4px" }}>
                {beast.abilityDesc}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: T.inkFaint }}>No ability data</div>
          )}

          <div style={{
            fontSize: 10.5, color: T.inkFaint, lineHeight: 1.5,
            fontStyle: "italic",
            borderTop: `1px dashed ${rc}44`,
            paddingTop: 7, marginTop: 2,
          }}>{beast.desc?.slice(0, 80)}{beast.desc?.length > 80 ? "…" : ""}</div>

          <div style={{ fontSize: 10, color: T.inkFaint }}>tap to flip back</div>
        </div>
      </div>
    </PressBox>
  );
}

// ── BottomNav ─────────────────────────────────────────────────────────────────
// Frosted glass bar with proper safe-area-inset-bottom and 52px+ tap targets.

const TABS = [
  { id: "home",       emoji: "🏠", label: "Home"      },
  { id: "adventure",  emoji: "🗺️", label: "Explore"   },
  { id: "garden",     emoji: "🌿", label: "Garden"    },
  { id: "collection", emoji: "📖", label: "Beastiary" },
  { id: "team",       emoji: "🐾", label: "My Team"   },
  { id: "story",      emoji: "📜", label: "Story"     },
];

export function BottomNav({ tab, setTab }) {
  return (
    <div style={{
      position: "fixed",
      bottom: 0, left: "50%",
      transform: "translateX(-50%)",
      width: "100%", maxWidth: 480,
      zIndex: 50,
      // prevent tap bleed-through
      WebkitTapHighlightColor: "transparent",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.90)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderTop: "1.5px solid rgba(196,181,253,0.40)",
        display: "flex",
        // padding-bottom accounts for iOS home indicator
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
        paddingTop: 6,
        gap: 3,
        paddingLeft: 6,
        paddingRight: 6,
      }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                background: active ? "linear-gradient(145deg,#ede9fe,#fce7f3)" : "transparent",
                border: active ? "1.5px solid #c4b5fd66" : "1.5px solid transparent",
                borderRadius: 16,
                // 52px min height = proper mobile touch target
                minHeight: 52,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                cursor: "pointer",
                padding: "6px 2px",
                transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                transform: active ? "scale(1.06)" : "scale(1)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div style={{
                fontSize: active ? 24 : 20,
                lineHeight: 1,
                filter: active ? "none" : "grayscale(0.6) opacity(0.5)",
                transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
              }}>{t.emoji}</div>

              <div style={{
                fontSize: 9,
                fontFamily: T.fontBody,
                fontWeight: active ? 900 : 700,
                color: active ? T.violet : T.inkFaint,
                letterSpacing: 0.2,
                transition: "color 0.2s",
                lineHeight: 1,
              }}>{t.label}</div>

              {active && (
                <div style={{
                  width: 4, height: 4,
                  background: "linear-gradient(135deg,#818cf8,#c084fc)",
                  borderRadius: "50%",
                  boxShadow: "0 0 6px #818cf8aa",
                  animation: "sparkle 2s ease-in-out infinite",
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Notification ──────────────────────────────────────────────────────────────
// Kawaii speech-bubble toast. Sits below the status bar (top: env(safe-area-inset-top)).
// Has a little upward triangle tail for the speech-bubble effect.

export function Notification({ notification }) {
  if (!notification) return null;
  const color = notification.color ?? T.violet;
  return (
    <div
      className="notification-toast"
      style={{
        // respect iOS notch / dynamic island
        top: "calc(env(safe-area-inset-top, 12px) + 10px)",
        background: `linear-gradient(135deg, ${color}f0, ${color}cc)`,
        border: `1.5px solid ${color}99`,
      }}
    >
      {/* Speech-bubble upward tail */}
      <div style={{
        position: "absolute",
        top: -9, left: "50%",
        transform: "translateX(-50%)",
        width: 0, height: 0,
        borderLeft: "9px solid transparent",
        borderRight: "9px solid transparent",
        borderBottom: `9px solid ${color}f0`,
        pointerEvents: "none",
      }} />

      {notification.icon && (
        <span style={{ fontSize: 20, flexShrink: 0 }}>{notification.icon}</span>
      )}

      <span style={{
        flex: 1, textAlign: "center",
        fontFamily: T.fontBody, fontWeight: 800,
        // 15px minimum for mobile readability
        fontSize: 15,
        color: "#fff",
        textShadow: "0 1px 3px rgba(0,0,0,0.2)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {notification.msg}
      </span>
    </div>
  );
}

// ── XPBar ─────────────────────────────────────────────────────────────────────
// Taller track (14px) for mobile legibility. Milestone pips. "Almost!" pulse.

export function XPBar({ xp, level }) {
  const needed     = XP_PER_LEVEL(level);
  const pct        = Math.min((xp / needed) * 100, 100);
  const almostFull = pct >= 88;

  return (
    <div style={{ width: "100%" }}>
      {/* Labels row */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        marginBottom: 6,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 900, fontFamily: T.fontBody,
          color: "rgba(255,255,255,0.72)",
          textTransform: "uppercase", letterSpacing: 1.4,
        }}>XP</span>
        <span style={{
          fontSize: 12, fontWeight: 700, fontFamily: T.fontBody,
          color: "rgba(255,255,255,0.90)",
        }}>{xp} <span style={{ opacity: 0.55 }}>/ {needed}</span></span>
      </div>

      {/* Track — 14px so fingers can see it clearly */}
      <div style={{
        background: "rgba(255,255,255,0.22)",
        borderRadius: 99,
        height: 14,
        position: "relative",
        border: "1px solid rgba(255,255,255,0.18)",
        overflow: "visible",
      }}>
        {/* Fill */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          borderRadius: 99,
          background: almostFull
            ? "linear-gradient(90deg,#fff,#fef08a,#fbbf24)"
            : "linear-gradient(90deg,rgba(255,255,255,0.92),rgba(255,255,255,0.70))",
          backgroundSize: "200% 100%",
          animation: "shimmerBar 2.5s linear infinite",
          transition: "width 0.7s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: almostFull
            ? "0 0 14px rgba(251,191,36,0.75)"
            : "0 0 8px rgba(255,255,255,0.55)",
        }}>
          {/* Sparkle bead at leading edge */}
          {pct > 5 && (
            <div style={{
              position: "absolute", right: -3, top: "50%",
              transform: "translateY(-50%)",
              width: 12, height: 12, borderRadius: "50%",
              background: almostFull ? "#fbbf24" : "#fff",
              boxShadow: almostFull
                ? "0 0 8px #fbbf24,0 0 18px #fbbf2499"
                : "0 0 8px #fff",
              animation: "sparkle 1.4s ease-in-out infinite",
            }} />
          )}
        </div>

        {/* Milestone pips */}
        {[25, 50, 75].map(pip => (
          <div key={pip} style={{
            position: "absolute",
            left: `${pip}%`, top: "50%",
            transform: "translate(-50%,-50%)",
            width: 3, height: 18,
            borderRadius: 2,
            background: pct >= pip ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.28)",
            transition: "background 0.4s",
            zIndex: 2,
          }} />
        ))}
      </div>

      {almostFull && (
        <div style={{
          textAlign: "right", marginTop: 5,
          fontSize: 11, fontWeight: 800,
          color: "#fef08a", fontFamily: T.fontBody,
          animation: "heartbeat 1s ease-in-out infinite",
          textShadow: "0 0 8px rgba(251,191,36,0.6)",
          letterSpacing: 0.4,
        }}>✨ Almost level up!</div>
      )}
    </div>
  );
}

// ── PlayerHeader ──────────────────────────────────────────────────────────────
// Full-width hero banner. Respects safe-area-inset-top for iPhones.

export function PlayerHeader({ playerLevel, xp, tameStreak = 0, collectionCount = 0 }) {
  return (
    <div style={{
      background: "linear-gradient(135deg,#6366f1,#818cf8 40%,#c084fc 70%,#f472b6)",
      backgroundSize: "300% 300%",
      animation: "shimmerBar 8s ease-in-out infinite",
      // padding-top respects the status bar / notch
      paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)",
      paddingBottom: 20,
      paddingLeft: 20,
      paddingRight: 20,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: "absolute", top: -30, right: -25,
        width: 120, height: 120, borderRadius: "50%",
        background: "rgba(255,255,255,0.10)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -35, left: 5,
        width: 90, height: 90, borderRadius: "50%",
        background: "rgba(255,255,255,0.07)", pointerEvents: "none",
      }} />

      {/* Title row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{
            fontSize: 13, fontWeight: 900, fontFamily: T.fontBody,
            color: "rgba(255,255,255,0.70)",
            textTransform: "uppercase", letterSpacing: 1.6,
          }}>✦ Soul Tamer</div>
          <div style={{
            fontFamily: T.fontDisplay, fontSize: 26, color: "#fff",
            lineHeight: 1.1, marginTop: 2,
            textShadow: "0 2px 10px rgba(0,0,0,0.18)",
          }}>Your Journey</div>
        </div>

        {/* Level badge — bigger for thumb-friendly glance */}
        <div style={{
          background: "rgba(255,255,255,0.22)",
          border: "1.5px solid rgba(255,255,255,0.38)",
          borderRadius: 18,
          padding: "8px 18px",
          backdropFilter: "blur(10px)",
          textAlign: "center",
          minWidth: 68,
        }}>
          <div style={{
            fontSize: 10, color: "rgba(255,255,255,0.68)",
            fontWeight: 900, letterSpacing: 1.4, textTransform: "uppercase",
            fontFamily: T.fontBody,
          }}>Level</div>
          <div style={{
            fontFamily: T.fontDisplay, fontSize: 30, color: "#fff",
            lineHeight: 1.05, textShadow: "0 2px 10px rgba(0,0,0,0.18)",
          }}>{playerLevel}</div>
        </div>
      </div>

      {/* XP bar */}
      <XPBar xp={xp} level={playerLevel} />

      {/* Stat chips — full 48px height for easy reading at a glance */}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {[
          { emoji: "📖", label: "Beasts",  value: collectionCount },
          { emoji: "🔥", label: "Streak",  value: tameStreak > 0 ? `×${tameStreak}` : "—" },
        ].map(stat => (
          <div key={stat.label} style={{
            flex: 1,
            background: "rgba(255,255,255,0.16)",
            border: "1.5px solid rgba(255,255,255,0.25)",
            borderRadius: 14,
            padding: "10px 12px",
            display: "flex", alignItems: "center", gap: 9,
            backdropFilter: "blur(8px)",
            minHeight: 48,
          }}>
            <span style={{ fontSize: 22 }}>{stat.emoji}</span>
            <div>
              <div style={{
                fontSize: 10, color: "rgba(255,255,255,0.62)",
                fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.1,
                fontFamily: T.fontBody, lineHeight: 1,
              }}>{stat.label}</div>
              <div style={{
                fontFamily: T.fontDisplay, fontSize: 20, color: "#fff",
                lineHeight: 1.1,
              }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DailyQuestPanel ───────────────────────────────────────────────────────────
// Collapsible. Quest rows are 56px+ tall for easy tap targets.

export function DailyQuestPanel({ quests, questState }) {
  const [open, setOpen] = useState(true);

  const doneCount = quests.filter(q => questState[q.id]?.done).length;
  const allDone   = doneCount === quests.length;

  return (
    <div style={{
      background: allDone
        ? "linear-gradient(135deg,#f0fdf4,#dcfce7)"
        : "linear-gradient(135deg,#fefce8,#faf8ff)",
      border: allDone ? "1.5px solid #86efac" : "1.5px solid #e9d5ff",
      borderRadius: 20,
      overflow: "hidden",
    }}>
      {/* Header — 52px min-height tap target */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", background: "none", border: "none",
          cursor: "pointer",
          padding: "14px 16px",
          display: "flex", alignItems: "center", gap: 10,
          fontFamily: T.fontBody,
          minHeight: 52,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span style={{ fontSize: 22, flexShrink: 0 }}>🌸</span>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{
            fontFamily: T.fontDisplay, fontSize: 16,
            color: allDone ? "#16a34a" : T.inkDark,
            lineHeight: 1.2,
          }}>Daily Quests</div>
          <div style={{ fontSize: 12, color: T.inkMid, fontWeight: 700 }}>
            {doneCount}/{quests.length} complete{allDone ? " 🎉" : ""}
          </div>
        </div>

        {/* Status dots */}
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {quests.map(q => (
            <div key={q.id} style={{
              width: 9, height: 9, borderRadius: "50%",
              background: questState[q.id]?.done ? "#4ade80" : "#e9d5ff",
              border: `1.5px solid ${questState[q.id]?.done ? "#4ade80" : "#c4b5fd"}`,
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        <span style={{
          fontSize: 16, color: T.inkFaint,
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform 0.22s",
          display: "inline-block", flexShrink: 0,
          lineHeight: 1,
        }}>▾</span>
      </button>

      {open && (
        <div style={{ padding: "0 12px 14px", display: "flex", flexDirection: "column", gap: 9 }}>
          {quests.map((q, i) => {
            const state    = questState[q.id] ?? { progress: 0, done: false };
            const progress = Math.min(state.progress, q.goal);
            const pct      = Math.min((progress / q.goal) * 100, 100);

            return (
              <div
                key={q.id}
                className={`quest-card fadein stagger-${i + 1}${state.done ? " quest-done" : ""}`}
                // min-height 56px = comfortably tappable row if we add tapping later
                style={{ minHeight: 56 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{q.emoji}</span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: T.fontBody, fontWeight: 800,
                      fontSize: 14,
                      color: state.done ? "#16a34a" : T.inkDark,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{q.label}</div>
                    <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 1 }}>
                      {progress}/{q.goal} · +{q.reward} XP
                    </div>
                  </div>

                  {state.done ? (
                    <div style={{
                      fontFamily: T.fontDisplay, fontSize: 11,
                      color: "#16a34a", background: "#dcfce7",
                      border: "1.5px solid #86efac",
                      borderRadius: 10, padding: "3px 9px",
                      flexShrink: 0,
                      animation: "heartbeat 1.5s ease-in-out 1",
                    }}>Done ✓</div>
                  ) : (
                    <div style={{
                      fontSize: 12, color: T.violet, fontWeight: 800,
                      flexShrink: 0, fontFamily: T.fontBody,
                    }}>{Math.round(pct)}%</div>
                  )}
                </div>

                {!state.done && (
                  <div className="quest-progress-bar" style={{ marginTop: 8 }}>
                    <div className="quest-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}