import { XPBar } from "../components/ui";

export default function HomeView({ game }) {
  const { playerLevel, xp, collection, log, XP_PER_LEVEL, resetSave, setCurrentTab } = game;

  return (
    <div className="fadein" style={{ padding: "16px 16px 80px", minHeight: "100dvh", boxSizing: "border-box" }}>

      {/* Header */}
      <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 26, color: "#4338ca", marginBottom: 4 }}>
        🌟 Beast Tamer
      </div>
      <p style={{ color: "#64748b", fontSize: 14, marginTop: 0 }}>
        Explore the world, find wild beasts, and build your collection!
      </p>

      {/* Level card */}
      <div style={{
        background: "linear-gradient(135deg, #818cf8, #c084fc)",
        borderRadius: 20, padding: "16px 20px", marginBottom: 16,
        boxShadow: "0 4px 20px #818cf844",
      }}>
        <div style={{ color: "#e0e7ff", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>TAMER LEVEL</div>
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 40, color: "#fff", lineHeight: 1 }}>{playerLevel}</div>
        <div style={{ marginTop: 10 }}>
          <XPBar xp={xp} level={playerLevel} />
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <StatChip emoji="🐾" label="Beasts Tamed" value={collection.length} />
        <StatChip emoji="📖" label="XP to Next" value={XP_PER_LEVEL(playerLevel) - xp} />
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setCurrentTab("adventure")} style={{
          flex: 1, border: "none", borderRadius: 16, padding: "14px 10px",
          background: "linear-gradient(135deg, #818cf8, #c084fc)", color: "#fff",
          fontFamily: "'Fredoka One', cursive", fontSize: 15, cursor: "pointer",
          boxShadow: "0 4px 16px #818cf844",
        }}>🗺️ Adventure!</button>
        <button onClick={() => setCurrentTab("garden")} style={{
          flex: 1, border: "none", borderRadius: 16, padding: "14px 10px",
          background: "linear-gradient(135deg, #6ee7b7, #34d399)", color: "#fff",
          fontFamily: "'Fredoka One', cursive", fontSize: 15, cursor: "pointer",
          boxShadow: "0 4px 16px #6ee7b744",
        }}>🌿 Garden</button>
      </div>

      {/* Recent activity */}
      {log.length > 0 && (
        <div>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 15, color: "#4338ca", marginBottom: 8 }}>
            📋 Recent Activity
          </div>
          {log.slice(0, 5).map((entry, i) => (
            <div key={i} style={{
              fontSize: 13, color: "#64748b",
              padding: "8px 12px",
              background: "#fff",
              borderRadius: 10,
              marginBottom: 6,
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}>
              {entry}
            </div>
          ))}
        </div>
      )}

      {/* Reset */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <button onClick={() => { resetSave(); window.location.reload(); }} style={{
          border: "1.5px solid #e2e8f0", borderRadius: 50, padding: "8px 20px",
          background: "none", color: "#94a3b8", fontSize: 12, cursor: "pointer",
        }}>🗑️ Reset Save</button>
      </div>
    </div>
  );
}

function StatChip({ emoji, label, value }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "#fff", borderRadius: 16, padding: "12px 10px",
      border: "1.5px solid #e2e8f0", flex: 1,
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    }}>
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20, color: "#4338ca" }}>{value}</span>
      <span style={{ fontSize: 10, color: "#94a3b8", textAlign: "center" }}>{label}</span>
    </div>
  );
}
