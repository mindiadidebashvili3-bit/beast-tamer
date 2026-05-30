import { BEASTS, RARITY_COLORS } from "../data/data";
import { BeastCard } from "../components/ui";

export default function CollectionView({ game }) {
  const { collection, playerLevel } = game;
  const ownedIds = new Set(collection.map(b => b.id));

  return (
    <div className="fadein">
      <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "#4338ca", marginBottom: 4 }}>
        📖 Beastiary
      </div>
      <p style={{ color: "#64748b", fontSize: 14, marginTop: 0 }}>
        Collected: <strong>{collection.length}</strong> / {BEASTS.length} beasts
      </p>

      {/* Rarity legend */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {Object.entries(RARITY_COLORS).map(([r, c]) => (
          <div key={r} style={{
            background: `${c}22`, border: `1.5px solid ${c}`,
            borderRadius: 50, padding: "2px 10px",
            fontSize: 11, fontWeight: 700, color: c,
          }}>
            {r}
          </div>
        ))}
      </div>

      {/* Beast grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {BEASTS.map(beast => {
          const owned = ownedIds.has(beast.id);
          return (
            <div key={beast.id} style={{ opacity: owned ? 1 : 0.35, filter: owned ? "none" : "grayscale(1)" }}>
              <BeastCard beast={beast} owned={owned} small />
              {!owned && (
                <div style={{ textAlign: "center", fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
                  {playerLevel < beast.level ? `Needs Lv.${beast.level}` : "Not yet found"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
