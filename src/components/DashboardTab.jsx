import { PORTFOLIO } from "../data";
import { CARD_BG, NAVY, GOLD, BORDER_BLUE } from "../constants";

const formatCurrency = (n) => "$" + n.toLocaleString();

const totalMatters = PORTFOLIO.cases.length;
const federalCount = PORTFOLIO.cases.filter(c => c.type === "Federal").length;
const stateCount = PORTFOLIO.cases.filter(c => c.type === "State").length;

const aggregateExposure = {
  conservative: formatCurrency(PORTFOLIO.damages_table.reduce((s, r) => s + r.conservative, 0)),
  moderate: formatCurrency(PORTFOLIO.damages_table.reduce((s, r) => s + r.moderate, 0)),
  aggressive: formatCurrency(PORTFOLIO.damages_table.reduce((s, r) => s + r.aggressive, 0)) + "+",
};

const clusterCounts = {
  1: PORTFOLIO.cases.filter(c => c.cluster === 1).length,
  2: PORTFOLIO.cases.filter(c => c.cluster === 2).length,
  3: PORTFOLIO.cases.filter(c => c.cluster === 3).length,
  4: PORTFOLIO.cases.filter(c => c.cluster === 4).length,
};

const clusterMatters = (n) => {
  const nums = PORTFOLIO.cases.filter(c => c.cluster === n).map(c => c.number).sort((a, b) => a - b);
  if (!nums.length) return "—";
  const ranges = [];
  let start = nums[0], end = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === end + 1) { end = nums[i]; }
    else { ranges.push(start === end ? `${start}` : `${start}–${end}`); start = end = nums[i]; }
  }
  ranges.push(start === end ? `${start}` : `${start}–${end}`);
  return ranges.join(", ");
};

export const DashboardTab = ({ upcomingEvents, setClusterFilter, setActiveTab }) => (
  <div>
    {/* Stats Row */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
      {[
        { label: "Active Matters", value: totalMatters, sub: `${federalCount} Federal · ${stateCount} State` },
        { label: "Jurisdictions", value: PORTFOLIO.jurisdictions.length, sub: "Courts across CA" },
        { label: "Aggregate Exposure", value: aggregateExposure.moderate, sub: "Moderate estimate" },
        { label: "Next Deadline", value: upcomingEvents[0]?.date || "—", sub: upcomingEvents[0]?.event?.slice(0, 35) || "" }
      ].map((s, i) => (
        <div key={i} style={{ background: CARD_BG, borderRadius: 10, padding: "20px 22px", border: `1px solid ${NAVY}`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: GOLD, borderRadius: "10px 0 0 10px" }} />
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "white" }}>{s.value}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B", marginTop: 4 }}>{s.sub}</div>
        </div>
      ))}
    </div>

    {/* Two-column: Upcoming + Clusters */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
      {/* Upcoming */}
      <div style={{ background: CARD_BG, borderRadius: 10, padding: 24, border: `1px solid ${NAVY}` }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: GOLD, margin: "0 0 16px", fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.5 }}>Upcoming Deadlines</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {upcomingEvents.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ minWidth: 90, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#F472B6", paddingTop: 2 }}>{e.date}</div>
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#CBD5E1" }}>{e.event}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B", marginTop: 2 }}>Matter {e.matters}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cluster Breakdown */}
      <div style={{ background: CARD_BG, borderRadius: 10, padding: 24, border: `1px solid ${NAVY}` }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: GOLD, margin: "0 0 16px", fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.5 }}>Case Clusters</h3>
        {[
          { n: 1, label: "CHP Traffic Stop, DUI Arrest & DMV", color: "#60A5FA" },
          { n: 2, label: "Parole Retaliation, HOPE Abuse & Policy 19-03", color: "#A78BFA" },
          { n: 3, label: "Consumer Fraud / Defective Vehicle", color: "#FBBF24" },
          { n: 4, label: "Administrative Writs & Habeas Corpus", color: "#34D399" }
        ].map(cl => (
          <div
            key={cl.n}
            role="button"
            tabIndex={0}
            style={{ marginBottom: 16, cursor: "pointer" }}
            onClick={() => { setClusterFilter(cl.n); setActiveTab("Matters"); }}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setClusterFilter(cl.n); setActiveTab("Matters"); } }}
            aria-label={`Filter matters by cluster: ${cl.label}`}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#CBD5E1" }}>{cl.label}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: cl.color, fontWeight: 700 }}>{clusterCounts[cl.n]} matters</span>
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#475569", marginBottom: 6 }}>Matters {clusterMatters(cl.n)}</div>
            <div style={{ height: 6, background: "#1E293B", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(clusterCounts[cl.n] / totalMatters) * 100}%`, background: cl.color, borderRadius: 3, transition: "width 0.6s ease" }} />
            </div>
          </div>
        ))}
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B", marginTop: 12, fontStyle: "italic" }}>Click a cluster to filter matters →</div>

        {/* Pertinent Filings */}
        <div style={{ marginTop: 24, borderTop: `1px solid ${NAVY}`, paddingTop: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: GOLD, margin: "0 0 12px", fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.5, textTransform: "uppercase" }}>Pertinent Filings</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { title: "Newanforbi v. Urrea, et al.", matter: 13 },
              { title: "Newanforbi v. Dodd, et al.", matter: 15 },
              { title: "Newanforbi v. Macomber", matter: 11 },
              { title: "Newanforbi v. Candelaria, et al", matter: 7 },
              { title: "Newanforbi v. Rojo, et al.", matter: 16 }
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#0F172A", borderRadius: 6, border: `1px solid ${BORDER_BLUE}25` }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "#CBD5E1" }}>{f.title}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8", background: "#1E293B", borderRadius: 4, padding: "2px 8px" }}>Matter {f.matter}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Courts Overview */}
    <div style={{ background: CARD_BG, borderRadius: 10, padding: 24, border: `1px solid ${NAVY}` }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: GOLD, margin: "0 0 16px", fontFamily: "'DM Sans', sans-serif" }}>Jurisdictional Distribution</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {PORTFOLIO.jurisdictions.map(j => {
          const count = PORTFOLIO.cases.filter(c => c.court === j).length;
          return (
            <div key={j} style={{ background: NAVY, borderRadius: 8, padding: "12px 18px", border: `1px solid ${BORDER_BLUE}30`, flex: "1 1 180px" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94A3B8", marginBottom: 4 }}>{j}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "white" }}>{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
