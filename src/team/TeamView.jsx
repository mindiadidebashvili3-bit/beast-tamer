import { RARITY_COLORS } from "../data/data";

export default function TeamView({ game }) {
  const { collection } = game;

  return (
    <div className="fadein" style={{ padding: "16px 16px 80px" }}>
      <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "#4338ca", marginBottom: 4 }}>
        🐾 My Team
      </div>
      <p style={{ color: "#64748b", fontSize: 14, marginTop: 0 }}>Your tamed beasts!</p>

      {collection.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 64 }}>🌿</div>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18, color: "#94a3b8", marginTop: 12 }}>
            No beasts yet!
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Go on an adventure to find some.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {collection.map(beast => (
            <div key={beast.id} className="fadein" style={{
              background: `linear-gradient(135deg, ${beast.color}33, #fff)`,
              border: `2px solid ${RARITY_COLORS[beast.rarity]}55`,
              borderRadius: 20, padding: "16px",
              display: "flex", gap: 14, alignItems: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            }}>
              <div style={{ fontSize: 48 }}>{beast.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18, color: "#1e1b4b" }}>
                  {beast.name}
                </div>
                {beast.role && (
                  <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 700, fontStyle: "italic" }}>
                    {beast.role}
                  </div>
                )}
                <div style={{ fontSize: 11, color: RARITY_COLORS[beast.rarity], fontWeight: 700, textTransform: "uppercase" }}>
                  {beast.rarity}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                  {beast.desc}
                </div>
              </div>
              <div style={{
                background: `${beast.color}55`, borderRadius: 50,
                padding: "6px 12px", fontWeight: 800, fontSize: 14, color: "#1e1b4b",
                flexShrink: 0,
              }}>
                Lv.{beast.level}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
