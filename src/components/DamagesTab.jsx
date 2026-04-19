import { PORTFOLIO } from "../data";
import { CARD_BG, NAVY, GOLD, CLUSTER_NAVY } from "../constants";

const formatCurrency = (n) => "$" + n.toLocaleString();

// Computed once at module load — bar widths normalize to the largest aggressive value,
// and per-view totals never change.
const MAX_AGGRESSIVE = PORTFOLIO.damages_table.reduce((m, x) => Math.max(m, x.aggressive), 0);
const VIEW_TOTALS = PORTFOLIO.damages_table.reduce(
  (acc, d) => {
    acc.conservative += d.conservative;
    acc.moderate += d.moderate;
    acc.aggressive += d.aggressive;
    return acc;
  },
  { conservative: 0, moderate: 0, aggressive: 0 }
);
const VIEWS = ["conservative", "moderate", "aggressive"];

export const DamagesTab = ({ damagesView, setDamagesView }) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "white", margin: 0 }}>Damages Analysis</h2>
      <div style={{ display: "flex", gap: 6 }}>
        {VIEWS.map(v => (
          <button key={v} onClick={() => setDamagesView(v)} style={{
            padding: "8px 16px", borderRadius: 6, border: damagesView === v ? `1px solid ${GOLD}` : `1px solid ${NAVY}`,
            background: damagesView === v ? `${GOLD}18` : CARD_BG, color: damagesView === v ? GOLD : "#94A3B8",
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize"
          }}>{v}</button>
        ))}
      </div>
    </div>

    {/* Aggregate Total Card */}
    <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${CLUSTER_NAVY} 100%)`, borderRadius: 12, padding: 28, border: `1px solid ${GOLD}30`, marginBottom: 24, textAlign: "center" }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: GOLD, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Aggregate Exposure — {damagesView}</div>
      <div style={{ fontSize: 48, fontWeight: 700, color: "white" }}>
        {formatCurrency(VIEW_TOTALS[damagesView])}
        {damagesView === "aggressive" && <span style={{ fontSize: 28, color: GOLD }}>+</span>}
      </div>
    </div>

    {/* Breakdown */}
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {PORTFOLIO.damages_table.map((d, i) => {
        const val = d[damagesView];
        const pct = (val / MAX_AGGRESSIVE) * 100;
        return (
          <div key={i} style={{ background: CARD_BG, borderRadius: 8, padding: "16px 20px", border: `1px solid ${NAVY}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#CBD5E1" }}>{d.category}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B", marginLeft: 10 }}>Matters {d.matters}</span>
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: "#34D399" }}>{formatCurrency(val)}{damagesView === "aggressive" && "+"}</span>
            </div>
            <div style={{ height: 5, background: "#1E293B", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${GOLD}, #34D399)`, borderRadius: 3, transition: "width 0.6s ease" }} />
            </div>
          </div>
        );
      })}
    </div>

    {/* Three-column comparison */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 24 }}>
      {VIEWS.map(v => {
        const total = VIEW_TOTALS[v];
        const isActive = v === damagesView;
        return (
          <button key={v} onClick={() => setDamagesView(v)} aria-pressed={isActive} style={{ width: "100%", background: isActive ? NAVY : CARD_BG, borderRadius: 10, padding: 20, border: isActive ? `1px solid ${GOLD}40` : `1px solid ${NAVY}`, cursor: "pointer", textAlign: "center", transition: "all 0.3s", color: "inherit", font: "inherit", margin: 0 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: isActive ? GOLD : "#64748B", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{v}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: isActive ? "white" : "#94A3B8" }}>{formatCurrency(total)}{v === "aggressive" && "+"}</div>
          </button>
        );
      })}
    </div>
  </div>
);
