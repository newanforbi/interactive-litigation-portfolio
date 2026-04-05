import { PORTFOLIO } from "../data";
import { CARD_BG, NAVY, GOLD } from "../constants";

export const TheoriesTab = () => (
  <div>
    <h2 style={{ fontSize: 24, fontWeight: 700, color: "white", marginBottom: 24 }}>Thematic Legal Theories</h2>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
      {PORTFOLIO.theories.map(t => (
        <div key={t.id} style={{ background: CARD_BG, borderRadius: 10, padding: 24, border: `1px solid ${NAVY}`, display: "flex", flexDirection: "column", gap: 12, transition: "border-color 0.3s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>{t.icon}</span>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.3 }}>{t.title}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: GOLD, marginTop: 2 }}>Matters {t.matters}</div>
            </div>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94A3B8", lineHeight: 1.7, margin: 0 }}>{t.desc}</p>
        </div>
      ))}
    </div>
  </div>
);
