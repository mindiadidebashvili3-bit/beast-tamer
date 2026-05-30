import { RARITY_COLORS, RARITY_GLOW } from "../data/data";

// ── Particle configs ──────────────────────────────────────────────────────────
const PCFG = {
  petals:   { emojis: ["🌸","🌼","·"], count: 10, anim: "floatDown", dur: [3,5],   fromTop: true  },
  leaves:   { emojis: ["🍂","🍁","🌿"], count: 8,  anim: "floatSide", dur: [4,6],   fromTop: true  },
  sparkles: { emojis: ["✨","·","·"],   count: 12, anim: "floatUp",   dur: [2,4],   fromTop: false },
  embers:   { emojis: ["🔸","·","·"],   count: 10, anim: "floatUp",   dur: [1.5,3], fromTop: false },
  void:     { emojis: ["·","·","·"],    count: 7,  anim: "floatSide", dur: [5,8],   fromTop: true  },
};

function Particles({ type }) {
  const cfg = PCFG[type] ?? PCFG.sparkles;
  return (
    <>
      {Array.from({ length: cfg.count }).map((_, i) => {
        const x     = (i / cfg.count) * 96 + 2;
        const delay = (i * 0.38) % 3.8;
        const dur   = cfg.dur[0] + (i % 3) * ((cfg.dur[1] - cfg.dur[0]) / 2);
        const em    = cfg.emojis[i % cfg.emojis.length];
        const sz    = 9 + (i % 5) * 2;
        const top   = cfg.fromTop ? "-8%" : `${58 + (i % 30)}%`;
        return (
          <span key={i} style={{
            position: "absolute", left: `${x}%`, top,
            fontSize: sz, opacity: 0.55, pointerEvents: "none",
            animation: `${cfg.anim} ${dur}s ${delay}s infinite linear`,
            zIndex: 1,
          }}>{em}</span>
        );
      })}
    </>
  );
}

// ── Scene (the visual zone canvas) ───────────────────────────────────────────
function Scene({ zone, spots, investigated, investigating, playerPos, onSpotClick }) {
  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: 210,
      background: zone.sky,
      overflow: "hidden",
      borderRadius: "16px 16px 0 0",
    }}>
      <Particles type={zone.particles} />

      {/* Ground */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "42%",
        background: zone.ground,
      }} />

      {/* Zone decorations */}
      {zone.deco.map((d, i) => (
        <span key={i} style={{
          position: "absolute", left: `${d.x}%`, top: `${d.y}%`,
          fontSize: d.s, lineHeight: 1, pointerEvents: "none",
          filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.25))",
          zIndex: 2,
        }}>{d.e}</span>
      ))}

      {/* Investigatable spots */}
      {spots.map(spot => {
        const done = investigated.has(spot.id);
        const busy = investigating === spot.id;
        return (
          <button
            key={spot.id}
            onClick={() => !done && !investigating && onSpotClick(spot)}
            style={{
              position: "absolute",
              left: `${spot.x}%`, top: `${spot.y}%`,
              transform: "translate(-50%, -50%)",
              background: done ? "rgba(255,255,255,0.2)" : busy ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.85)",
              backdropFilter: "blur(4px)",
              border: `2px solid ${done ? "rgba(255,255,255,0.25)" : busy ? "#6366f1" : "rgba(255,255,255,0.75)"}`,
              borderRadius: 30,
              padding: "4px 10px 4px 6px",
              display: "flex", alignItems: "center", gap: 4,
              cursor: done ? "default" : busy ? "wait" : "pointer",
              opacity: done ? 0.4 : 1,
              zIndex: 10,
              whiteSpace: "nowrap",
              boxShadow: done || busy ? "none" : "0 2px 10px rgba(0,0,0,0.18)",
              fontSize: 12, fontWeight: 700,
              color: done ? "#94a3b8" : busy ? "#4338ca" : "#1e1b4b",
              transition: "all 0.2s",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            <span style={{
              fontSize: 17,
              animation: busy ? "spin 1s linear infinite" : "none",
              display: "inline-block",
            }}>{done ? "✓" : spot.emoji}</span>
            <span style={{ fontSize: 11 }}>{spot.label}</span>
            {!done && !busy && (
              <span style={{
                position: "absolute", top: -3, right: -3,
                width: 8, height: 8, background: "#6366f1",
                borderRadius: "50%",
                animation: "ping 1.5s ease-in-out infinite",
              }} />
            )}
          </button>
        );
      })}

      {/* Player character */}
      <div style={{
        position: "absolute",
        left: `${playerPos.x}%`, top: `${playerPos.y}%`,
        transform: "translate(-50%,-50%)",
        fontSize: 24,
        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))",
        zIndex: 8,
        transition: "left 0.65s cubic-bezier(0.34,1.56,0.64,1), top 0.65s cubic-bezier(0.34,1.56,0.64,1)",
        animation: "bounce 1.8s ease-in-out infinite",
      }}>🧑‍🌾</div>

      {/* Ambience label */}
      <div style={{
        position: "absolute", top: 8, right: 10,
        background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)",
        borderRadius: 12, padding: "3px 10px",
        fontSize: 10, color: "#fff", fontWeight: 700,
        fontFamily: "'Nunito', sans-serif",
        maxWidth: "55%", lineHeight: 1.3,
      }}>{zone.ambience}</div>
    </div>
  );
}

// ── Phase 1: Zone List ────────────────────────────────────────────────────────
function ZoneList({ zones, playerLevel, onSelect }) {
  return (
    <div className="fadein">
      <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "#4338ca", marginBottom: 4 }}>
        🗺️ Adventure
      </div>
      <p style={{ color: "#64748b", fontSize: 13, marginTop: 0, marginBottom: 14 }}>
        Choose a zone to explore — investigate spots to find wild beasts!
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {zones.map(zone => {
          const locked = playerLevel < zone.minLevel;
          const isDark = zone.color === "#1e1b4b" || zone.id === "void";
          const textCol = isDark ? "#e0e7ff" : "#1e1b4b";
          const subCol  = isDark ? "#a5b4fc" : "#64748b";
          const metaCol = isDark ? "#818cf8" : "#94a3b8";
          return (
            <div
              key={zone.id}
              className="zone-card"
              onClick={() => !locked && onSelect(zone)}
              style={{
                background: locked ? "#f8fafc" : `linear-gradient(135deg, ${zone.color}, ${zone.color}cc)`,
                border: locked ? "2px solid #e2e8f0" : `2px solid ${zone.color}66`,
                opacity: locked ? 0.55 : 1,
                cursor: locked ? "not-allowed" : "pointer",
                boxShadow: locked ? "none" : `0 4px 20px ${zone.color}55`,
                position: "relative", overflow: "hidden",
              }}
            >
              {/* Shimmer */}
              {!locked && (
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 14, pointerEvents: "none",
                  background: "linear-gradient(120deg,transparent 30%,rgba(255,255,255,0.18) 50%,transparent 70%)",
                }} />
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
                <div style={{ fontSize: 36, flexShrink: 0 }}>{zone.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16, color: textCol }}>
                    {zone.name} {locked && "🔒"}
                  </div>
                  <div style={{ fontSize: 10, color: "#818cf8", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.1, marginTop: 2 }}>
                    {zone.act}: {zone.actTitle}
                  </div>
                  <div style={{ fontSize: 12, color: subCol, marginTop: 3, lineHeight: 1.4 }}>{zone.desc}</div>
                  <div style={{ fontSize: 11, color: metaCol, marginTop: 5 }}>
                    Req. Lv.{zone.minLevel} · Beast Lv.{zone.beastLevels.join("–")} · {zone.spots.length} spots
                  </div>
                </div>
                {!locked && <div style={{ fontSize: 18, color: isDark ? "#a5b4fc" : "#818cf8" }}>›</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Phase 2: Route Select ─────────────────────────────────────────────────────
function RouteSelect({ zone, onSelect, onBack }) {
  return (
    <div className="fadein">
      {/* Back */}
      <button onClick={onBack} style={{
        border: "none", background: "none", color: "#818cf8",
        fontWeight: 800, fontSize: 14, cursor: "pointer",
        padding: "0 0 12px", fontFamily: "'Nunito', sans-serif",
        display: "flex", alignItems: "center", gap: 4,
      }}>‹ Back</button>

      {/* Zone preview */}
      <div style={{
        position: "relative", height: 150, borderRadius: 20,
        overflow: "hidden", marginBottom: 16,
        background: zone.sky,
      }}>
        <Particles type={zone.particles} />
        {zone.deco.map((d, i) => (
          <span key={i} style={{
            position: "absolute", left: `${d.x}%`, top: `${d.y}%`,
            fontSize: d.s, lineHeight: 1, pointerEvents: "none", zIndex: 2,
          }}>{d.e}</span>
        ))}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "38%",
          background: zone.ground,
        }} />
        <div style={{
          position: "absolute", bottom: 12, left: 16,
          fontFamily: "'Fredoka One', cursive", fontSize: 18, color: "#fff",
          textShadow: "0 2px 8px rgba(0,0,0,0.5)", zIndex: 5,
        }}>{zone.emoji} {zone.name}</div>
        <div style={{
          position: "absolute", top: 8, right: 10,
          background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)",
          borderRadius: 12, padding: "3px 10px",
          fontSize: 10, color: "#fff", fontWeight: 700, zIndex: 5,
          fontFamily: "'Nunito', sans-serif",
        }}>{zone.ambience}</div>
      </div>

      <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16, color: "#4338ca", marginBottom: 4 }}>
        🛤️ Choose Your Path
      </div>
      <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px", lineHeight: 1.4 }}>
        Each route leads somewhere different. More risk = rarer encounters~
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {zone.routes.map(route => (
          <div
            key={route.id}
            onClick={() => onSelect(route)}
            style={{
              background: "#fff", border: "2.5px solid #e5e7eb",
              borderRadius: 18, padding: 16, cursor: "pointer",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              transition: "transform 0.18s, box-shadow 0.18s",
              display: "flex", alignItems: "center", gap: 14,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}
          >
            <div style={{ fontSize: 32, flexShrink: 0 }}>{route.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 15, color: "#1e1b4b" }}>{route.label}</div>
                <span style={{
                  fontSize: 9, fontWeight: 800,
                  background: `${route.tc}22`, color: route.tc,
                  border: `1px solid ${route.tc}66`,
                  borderRadius: 20, padding: "2px 8px",
                  textTransform: "uppercase", letterSpacing: 0.8,
                }}>{route.tag}</span>
              </div>
              <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>{route.desc}</div>
            </div>
            <div style={{ fontSize: 18, color: "#818cf8", flexShrink: 0 }}>›</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Phase 3: Explore View ─────────────────────────────────────────────────────
function ExploreView({ zone, route, investigated, investigating, playerPos, beastsFound, onSpotClick, onBack, onDone }) {
  const allDone = investigated.size >= zone.spots.length;

  return (
    <div className="fadein">
      {/* Scene */}
      <Scene
        zone={zone}
        spots={zone.spots}
        investigated={investigated}
        investigating={investigating}
        playerPos={playerPos}
        onSpotClick={onSpotClick}
      />

      {/* Stats bar */}
      <div style={{
        background: "#fff", padding: "10px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid #f1f5f9",
      }}>
        <div style={{ fontSize: 13, color: "#475569" }}>
          <span style={{ fontWeight: 800, color: "#6366f1" }}>{investigated.size}</span>/{zone.spots.length} spots ·{" "}
          <span style={{ fontWeight: 700, color: "#059669" }}>{beastsFound} found</span>
        </div>
        {allDone ? (
          <button onClick={onDone} style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
            border: "none", borderRadius: 10, padding: "6px 14px",
            fontSize: 12, fontWeight: 800, cursor: "pointer",
            fontFamily: "'Nunito', sans-serif",
          }}>✓ Done Exploring</button>
        ) : (
          <button onClick={onBack} style={{
            background: "#f1f5f9", color: "#64748b",
            border: "none", borderRadius: 10, padding: "6px 12px",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Nunito', sans-serif",
          }}>‹ Back</button>
        )}
      </div>

      {/* Spot legend */}
      <div style={{ padding: "10px 14px", display: "flex", flexWrap: "wrap", gap: 7, background: "#fafafa" }}>
        {zone.spots.map(spot => {
          const done = investigated.has(spot.id);
          const busy = investigating === spot.id;
          return (
            <div
              key={spot.id}
              onClick={() => !done && !investigating && onSpotClick(spot)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background: done ? "#f1f5f9" : "#fff",
                border: `1px solid ${done ? "#e2e8f0" : busy ? "#818cf8" : "#e5e7eb"}`,
                borderRadius: 20, padding: "4px 10px",
                opacity: done ? 0.5 : 1,
                cursor: done || investigating ? "default" : "pointer",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 14 }}>{done ? "✓" : spot.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: done ? "#94a3b8" : "#475569" }}>{spot.label}</span>
            </div>
          );
        })}
      </div>

      {/* Route reminder */}
      <div style={{ padding: "8px 14px", background: "#fff", borderTop: "1px solid #f1f5f9" }}>
        <span style={{
          fontSize: 11, fontWeight: 700,
          background: `${route.tc}22`, color: route.tc,
          border: `1px solid ${route.tc}44`,
          borderRadius: 20, padding: "2px 10px",
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          {route.emoji} {route.label} · {route.tag}
        </span>
        <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>Tap spots to investigate!</span>
      </div>
    </div>
  );
}

// ── EncounterModal ────────────────────────────────────────────────────────────
export function EncounterModal({ adventureResult, tameAnim, tameStreak, onTame, onFlee }) {
  if (!adventureResult) return null;
  const { beast, canTame, mood } = adventureResult;
  const rc = RARITY_COLORS[beast.rarity] ?? "#94a3b8";
  const rg = RARITY_GLOW[beast.rarity]   ?? "rgba(148,163,184,0.3)";
  const isLegendary = beast.rarity === "legendary";
  const isEpic      = beast.rarity === "epic";

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,10,40,0.58)",
      backdropFilter: "blur(6px)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20,
    }}>
      <div className="pop" style={{
        background: "#fff", borderRadius: 28, padding: "28px 24px",
        textAlign: "center", maxWidth: 330, width: "100%",
        boxShadow: `0 20px 60px rgba(0,0,0,0.22), 0 0 0 3px ${rg}, 0 0 36px ${rg}`,
        position: "relative", overflow: "hidden",
      }}>
        {/* Rarity bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: isLegendary ? "linear-gradient(90deg,#fbbf24,#f472b6,#fbbf24)"
                    : isEpic      ? "linear-gradient(90deg,#c084fc,#818cf8,#c084fc)"
                    : rc,
          backgroundSize: "200% 100%",
          animation: isLegendary || isEpic ? "shimmerBar 2s linear infinite" : "none",
        }} />

        <div style={{
          display: "inline-block", background: `${rc}22`, border: `1px solid ${rc}66`,
          borderRadius: 20, padding: "2px 10px", fontSize: 10, fontWeight: 800,
          color: rc, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10,
        }}>{beast.rarity}</div>

        <div
          className={tameAnim === "success" ? "bounce" : tameAnim === "fail" ? "shake" : "float"}
          style={{ fontSize: 72, marginBottom: 4, filter: `drop-shadow(0 4px 12px ${rg})` }}
        >{beast.emoji}</div>

        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "#1e1b4b", marginBottom: 2 }}>{beast.name}</div>
        {beast.role && <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 800, fontStyle: "italic", marginBottom: 4 }}>{beast.role}</div>}
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{beast.desc}</div>

        {beast.ability && (
          <div style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 10, padding: "6px 12px", fontSize: 12, color: "#16a34a", marginBottom: 8,
          }}>
            <strong>⚡ {beast.ability}:</strong> {beast.abilityDesc}
          </div>
        )}

        <div style={{
          display: "inline-block", background: "#f1f5f9", borderRadius: 50,
          padding: "4px 14px", fontSize: 13, fontWeight: 700, color: "#475569",
          marginBottom: mood ? 8 : 12,
        }}>Lv. {beast.level}</div>

        {mood && (
          <div style={{
            background: "linear-gradient(135deg,#fdf4ff,#ede9fe)", border: "1px solid #e9d5ff",
            borderRadius: 12, padding: "8px 14px", fontSize: 13, color: "#7c3aed",
            marginBottom: 10, display: "flex", alignItems: "center", gap: 6, justifyContent: "center",
          }}>
            <span style={{ fontSize: 18 }}>{mood.emoji}</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 800, fontSize: 12 }}>
                {mood.label} {mood.tameMod > 0 ? `(+${Math.round(mood.tameMod*100)}% tame)` : mood.tameMod < 0 ? `(${Math.round(mood.tameMod*100)}% tame)` : ""}
              </div>
              <div style={{ fontSize: 11, color: "#9333ea" }}>{mood.flavorText}</div>
            </div>
          </div>
        )}

        {tameStreak > 1 && (
          <div style={{
            background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1px solid #fed7aa",
            borderRadius: 12, padding: "6px 14px", fontSize: 12, color: "#ea580c",
            fontWeight: 800, marginBottom: 10,
          }}>🔥 {tameStreak}× Streak — tame chance boosted!</div>
        )}

        {!canTame && (
          <div style={{
            background: "#fee2e2", borderRadius: 12, padding: "10px 14px",
            fontSize: 13, color: "#dc2626", marginBottom: 12, fontWeight: 700,
          }}>⚠️ You need Level {beast.level} to tame!</div>
        )}

        {tameAnim ? (
          <div style={{ fontSize: 40, marginTop: 8 }}>{tameAnim === "success" ? "🎉" : "💨"}</div>
        ) : (
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 4 }}>
            {canTame && (
              <button className="action-btn" onClick={onTame} style={{
                background: "linear-gradient(135deg,#818cf8,#c084fc)", color: "#fff",
                boxShadow: "0 4px 16px #c084fc55",
              }}>✨ Tame!</button>
            )}
            <button className="action-btn" onClick={onFlee} style={{
              background: "#f1f5f9", color: "#64748b",
            }}>🏃 Flee</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── EventModal ────────────────────────────────────────────────────────────────
export function EventModal({ eventResult, onChoice }) {
  if (!eventResult) return null;
  const { event } = eventResult;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,10,40,0.52)",
      backdropFilter: "blur(6px)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20,
    }}>
      <div className="pop" style={{
        background: "linear-gradient(145deg,#fefce8,#fff7f0)",
        border: "2px solid #fde68a", borderRadius: 28, padding: "28px 24px",
        textAlign: "center", maxWidth: 320, width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 0 0 3px rgba(251,191,36,0.3)",
      }}>
        <div style={{ fontSize: 60, marginBottom: 8 }}>{event.emoji}</div>
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20, color: "#92400e", marginBottom: 6 }}>{event.title}</div>
        <div style={{ fontSize: 13, color: "#78350f", marginBottom: 20, lineHeight: 1.5 }}>{event.desc}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {event.choices.map((choice, i) => (
            <button key={i} className="action-btn" onClick={() => onChoice(choice)} style={{
              background: i === 0 ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : "#f1f5f9",
              color: i === 0 ? "#fff" : "#64748b",
              boxShadow: i === 0 ? "0 4px 16px #fbbf2455" : "none",
              width: "100%",
            }}>{choice.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── AdventureView (main) ──────────────────────────────────────────────────────
import { ZONES } from "../data/data";

export default function AdventureView({ game }) {
  const {
    playerLevel,
    adventurePhase,
    selectedZone,
    selectedRoute,
    investigated,
    investigating,
    playerPos,
    beastsFound,
    adventureResult,
    eventResult,
    tameAnim,
    tameStreak,
    selectZone,
    selectRoute,
    investigateSpot,
    adventureBack,
    doneExploring,
    attemptTame,
    flee,
    resolveEvent,
  } = game;

  return (
    <div style={{ padding: "16px 16px 80px" }}>
      {/* Modals (shown over any phase) */}
      <EncounterModal
        adventureResult={adventureResult}
        tameAnim={tameAnim}
        tameStreak={tameStreak}
        onTame={attemptTame}
        onFlee={flee}
      />
      <EventModal eventResult={eventResult} onChoice={resolveEvent} />

      {/* Phase router */}
      {adventurePhase === "zones" && (
        <ZoneList
          zones={ZONES}
          playerLevel={playerLevel}
          onSelect={selectZone}
        />
      )}

      {adventurePhase === "routes" && selectedZone && (
        <RouteSelect
          zone={selectedZone}
          onSelect={selectRoute}
          onBack={adventureBack}
        />
      )}

      {adventurePhase === "explore" && selectedZone && selectedRoute && (
        <ExploreView
          zone={selectedZone}
          route={selectedRoute}
          investigated={investigated}
          investigating={investigating}
          playerPos={playerPos}
          beastsFound={beastsFound}
          onSpotClick={investigateSpot}
          onBack={adventureBack}
          onDone={doneExploring}
        />
      )}
    </div>
  );
}
