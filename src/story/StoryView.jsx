import { useState } from "react";
import { ZONES } from "../data/data";

export default function StoryView({ game }) {
  const [storyAct, setStoryAct] = useState(null);

  return (
    <div className="fadein" style={{ padding: "16px 16px 80px" }}>
      <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "#4338ca", marginBottom: 4 }}>📖 The Story</div>
      <p style={{ color: "#64748b", fontSize: 14, marginTop: 0, marginBottom: 16 }}>The rise of Aethelgard's greatest Tamer.</p>

      {/* World Lore */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: "0 4px 20px #1e1b4b44" }}>
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16, color: "#a5b4fc", marginBottom: 8 }}>🌎 The Fall of Tamers</div>
        <div style={{ fontSize: 13, color: "#e0e7ff", lineHeight: 1.7 }}>
          In the world of <strong style={{ color: "#c4b5fd" }}>Aethelgard</strong>, the Adventurer's Guild is dominated by Holy Knights, Grand Mages, and Shadow Assassins. Power is measured by raw, immediate damage output.
        </div>
        <div style={{ fontSize: 13, color: "#e0e7ff", lineHeight: 1.7, marginTop: 10 }}>
          Tamers are universally mocked as "glorified pet-sitters." What the Guild doesn't realize: traditional classes hit a strict <strong style={{ color: "#fbbf24" }}>Stat Cap</strong>. Tamers possess a hidden passive called <strong style={{ color: "#818cf8" }}>Soul Resonance</strong> — every beast bond permanently transfers that creature's cosmic energy as pure XP.
        </div>
        <div style={{ fontSize: 13, color: "#e0e7ff", lineHeight: 1.7, marginTop: 10 }}>
          While a Mage casts one spell at a time, a high-level Tamer commands an entire <em>ecosystem of synchronized elemental forces.</em>
        </div>
      </div>

      {/* Acts */}
      <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16, color: "#4338ca", marginBottom: 10 }}>📜 The Campaign</div>
      {ZONES.filter((z, i, arr) => arr.findIndex(x => x.act === z.act && x.actTitle === z.actTitle) === i).map(zone => {
        const zonesInAct = ZONES.filter(z => z.act === zone.act && z.actTitle === zone.actTitle);
        const isOpen = storyAct === zone.act + zone.actTitle;
        return (
          <div key={zone.act + zone.actTitle}
            style={{ marginBottom: 10, background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "2px solid #e0e7ff" }}>
            <div
              onClick={() => setStoryAct(isOpen ? null : zone.act + zone.actTitle)}
              style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, background: isOpen ? "linear-gradient(135deg, #818cf8, #c084fc)" : "#fff" }}>
              <div style={{ fontSize: 28 }}>{zone.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: isOpen ? "#e0e7ff" : "#818cf8", textTransform: "uppercase", letterSpacing: 1 }}>{zone.act}</div>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 15, color: isOpen ? "#fff" : "#1e1b4b" }}>{zone.actTitle}</div>
                <div style={{ fontSize: 11, color: isOpen ? "#e0e7ff" : "#94a3b8", marginTop: 2 }}>
                  {zonesInAct.map(z => z.name).join(" · ")}
                </div>
              </div>
              <div style={{ fontSize: 16, color: isOpen ? "#fff" : "#94a3b8" }}>{isOpen ? "▲" : "▼"}</div>
            </div>
            {isOpen && (
              <div style={{ padding: "14px 16px", borderTop: "1px solid #e0e7ff" }}>
                {zonesInAct.map((z, i) => (
                  <div key={z.id} style={{ marginBottom: i < zonesInAct.length - 1 ? 12 : 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#818cf8", marginBottom: 4 }}>{z.emoji} {z.name}</div>
                    <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.65 }}>{z.story}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Tamer's Creed */}
      <div style={{ marginTop: 6, background: "linear-gradient(135deg, #1e1b4b, #312e81)", borderRadius: 20, padding: "18px 20px", boxShadow: "0 4px 20px #1e1b4b44" }}>
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 13, color: "#818cf8", marginBottom: 8, letterSpacing: 1 }}>📜 THE TAMER'S CREED</div>
        <div style={{ fontSize: 13, color: "#e0e7ff", fontStyle: "italic", lineHeight: 1.7 }}>
          "They rely on swords that dull and mana that drains. We rely on the endless, loyal fury of the wild. Let them laugh — until the sky starts roaring back."
        </div>
      </div>
    </div>
  );
}
