import { useState, useMemo } from "react";
import { StatusBadge, ClusterBadge, TypeBadge } from "./components/Badges";
import { NAVY, GOLD, BODY_GRAY, CLUSTER_NAVY, BORDER_BLUE, DARK_BG, CARD_BG, DEFAULT_DEADLINE, CLOCK_FREEZE_UNTIL } from "./constants";
import { getPDTMidnight, parseEventDatePDT } from "./utils/dateUtils";
import { useDeadlineClock } from "./hooks/useDeadlineClock";

import { PORTFOLIO } from "./data";


const tabs = ["Dashboard", "Matters", "Timeline", "Damages", "Theories"];

export default function LitigationPortfolio() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [expandedMatter, setExpandedMatter] = useState(null);
  const [clusterFilter, setClusterFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [damagesView, setDamagesView] = useState("moderate");
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [showClock, setShowClock] = useState(false);

  const filteredCases = useMemo(() => {
    return PORTFOLIO.cases.filter(c => {
      if (clusterFilter && c.cluster !== clusterFilter) return false;
      if (typeFilter && c.type !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return c.caption.toLowerCase().includes(q) || c.claims.toLowerCase().includes(q) || c.defendants.toLowerCase().includes(q) || c.key_facts.toLowerCase().includes(q);
      }
      return true;
    });
  }, [clusterFilter, typeFilter, searchQuery]);

  const federalCount = PORTFOLIO.cases.filter(c => c.type === "Federal").length;
  const stateCount = PORTFOLIO.cases.filter(c => c.type === "State").length;
  const today = getPDTMidnight();
  const upcomingEvents = PORTFOLIO.timeline
    .filter(t => t.upcoming && parseEventDatePDT(t.date) >= today)
    .sort((a, b) => parseEventDatePDT(a.date) - parseEventDatePDT(b.date));

  const timeLeft = useDeadlineClock(upcomingEvents);

  const totalMatters = PORTFOLIO.cases.length;

  const formatCurrency = (n) => "$" + n.toLocaleString();

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

  return (
    <div style={{ minHeight: "100vh", background: DARK_BG, color: "#E2E8F0", fontFamily: "'Cormorant Garamond', 'Georgia', serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`@keyframes clockPulse { 0%,100%{opacity:1} 50%{opacity:0.25} }`}</style>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${DARK_BG} 100%)`, borderBottom: `2px solid ${GOLD}`, padding: "28px 32px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ color: GOLD, fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", marginBottom: 6 }}>Litigation Portfolio</div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: "white", margin: 0, lineHeight: 1.1 }}>Brendan Ngehsi Newanforbi</h1>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: BODY_GRAY, marginTop: 6 }}>Pro Se / In Propria Persona · Prepared {PORTFOLIO.prepared_date}</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                padding: "8px 18px", borderRadius: 6, border: activeTab === t ? `1px solid ${GOLD}` : "1px solid transparent",
                background: activeTab === t ? `${GOLD}18` : "transparent", color: activeTab === t ? GOLD : "#94A3B8",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                letterSpacing: 0.5
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Deadline Clock Banner (permanent fixture) ── */}
      <div style={{
        background: "linear-gradient(90deg, #0F1A2E 0%, #1A2A49 50%, #0F1A2E 100%)",
        borderBottom: `1px solid ${timeLeft.urgent ? "#EF444440" : GOLD + "30"}`,
        padding: "10px 32px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 28, flexWrap: "wrap",
        position: "relative"
      }}>
        <div style={{ color: GOLD, fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", whiteSpace: "nowrap" }}>
          ⚖ Deadline Clock
        </div>
        {showClock && <>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {[{ v: timeLeft.days, l: "Days" }, { v: timeLeft.hours, l: "Hrs" }, { v: timeLeft.mins, l: "Min" }, { v: timeLeft.secs, l: "Sec" }].map(({ v, l }, i) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {i > 0 && <span style={{ color: "#334155", fontSize: 18, lineHeight: 1, paddingBottom: 10 }}>:</span>}
                <div style={{ textAlign: "center", minWidth: 36 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: timeLeft.frozen ? "#EF4444" : timeLeft.urgent ? "#EF4444" : "white", fontFamily: "'DM Sans', sans-serif", lineHeight: 1, animation: timeLeft.frozen ? "clockPulse 2.8s ease-in-out infinite" : "none" }}>
                    {String(v).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 9, color: "#475569", fontFamily: "'DM Sans', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>{l}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#94A3B8", maxWidth: 380, textAlign: "center", lineHeight: 1.4 }}>
            {timeLeft.label}
          </div>
        </>}
        <button onClick={() => setShowClock(v => !v)} style={{
          position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
          padding: "4px 10px", borderRadius: 5, border: `1px solid #475569`,
          background: "transparent", color: "#64748B", fontFamily: "'DM Sans', sans-serif",
          fontSize: 10, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5, textTransform: "uppercase"
        }}>
          {showClock ? "Hide" : "Show"}
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 60px" }}>

        {/* ============ DASHBOARD ============ */}
        {activeTab === "Dashboard" && (
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
                  <div key={cl.n} style={{ marginBottom: 16, cursor: "pointer" }} onClick={() => { setClusterFilter(cl.n); setActiveTab("Matters"); }}>
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
        )}

        {/* ============ MATTERS ============ */}
        {activeTab === "Matters" && (
          <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search matters…"
                style={{ flex: "1 1 200px", padding: "10px 16px", borderRadius: 8, border: `1px solid ${NAVY}`, background: CARD_BG, color: "#E2E8F0", fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none" }} />
              {[null, 1, 2, 3, 4].map(c => (
                <button key={c ?? "all"} onClick={() => setClusterFilter(c)} style={{
                  padding: "8px 14px", borderRadius: 6, border: clusterFilter === c ? `1px solid ${GOLD}` : `1px solid ${NAVY}`,
                  background: clusterFilter === c ? `${GOLD}18` : CARD_BG, color: clusterFilter === c ? GOLD : "#94A3B8",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer"
                }}>{c === null ? "All" : c === 1 ? "CHP" : c === 2 ? "Parole/HOPE" : c === 3 ? "Vehicle" : "Writs"}</button>
              ))}
              <span style={{ color: "#475569", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>|</span>
              {[null, "Federal", "State"].map(t => (
                <button key={t ?? "all"} onClick={() => setTypeFilter(t)} style={{
                  padding: "8px 14px", borderRadius: 6, border: typeFilter === t ? `1px solid ${GOLD}` : `1px solid ${NAVY}`,
                  background: typeFilter === t ? `${GOLD}18` : CARD_BG, color: typeFilter === t ? GOLD : "#94A3B8",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer"
                }}>{t ?? "All"}</button>
              ))}
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#64748B", marginLeft: "auto" }}>{filteredCases.length} of {PORTFOLIO.cases.length}</span>
            </div>

            {/* Matter Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredCases.map(c => {
                const isOpen = expandedMatter === c.number;
                return (
                  <div key={c.number} style={{ background: CARD_BG, borderRadius: 10, border: isOpen ? `1px solid ${GOLD}40` : `1px solid ${NAVY}`, overflow: "hidden", transition: "border-color 0.3s" }}>
                    {/* Header row */}
                    <div onClick={() => setExpandedMatter(isOpen ? null : c.number)} style={{ padding: "16px 22px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: GOLD, flexShrink: 0 }}>{c.number}</div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 3 }}>{c.caption}</div>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#64748B" }}>{c.case_no} · {c.court}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <ClusterBadge cluster={c.cluster} />
                        <TypeBadge type={c.type} />
                        <StatusBadge status={c.status} />
                      </div>
                      <div style={{ color: "#64748B", fontSize: 18, transition: "transform 0.3s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▾</div>
                    </div>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div style={{ padding: "0 22px 22px", borderTop: `1px solid ${NAVY}` }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, paddingTop: 18 }}>
                          <div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Defendants</div>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#CBD5E1", lineHeight: 1.6, margin: 0 }}>{c.defendants}</p>
                          </div>
                          <div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Judge</div>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#CBD5E1", margin: "0 0 12px" }}>{c.judge}</p>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Filed</div>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#CBD5E1", margin: 0 }}>{c.filed}</p>
                          </div>
                        </div>

                        <div style={{ marginTop: 18 }}>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Causes of Action</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {c.causes.map((ca, i) => (
                              <span key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, padding: "4px 10px", borderRadius: 4, background: NAVY, color: "#CBD5E1", border: `1px solid ${BORDER_BLUE}30` }}>{ca}</span>
                            ))}
                          </div>
                        </div>

                        <div style={{ marginTop: 18 }}>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Key Facts</div>
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94A3B8", lineHeight: 1.7, margin: 0 }}>{c.key_facts}</p>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 18 }}>
                          <div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Procedural Status</div>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94A3B8", lineHeight: 1.6, margin: 0 }}>{c.procedural_status}</p>
                          </div>
                          <div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Estimated Damages</div>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#34D399", fontWeight: 700, margin: "0 0 12px" }}>{c.damages}</p>
                            {c.risk && <>
                              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Risk / Defense Notes</div>
                              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#F59E0B", lineHeight: 1.6, margin: 0 }}>{c.risk}</p>
                            </>}
                          </div>
                        </div>

                        <div style={{ marginTop: 18 }}>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Key Evidence</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {c.evidence.map((ev, i) => (
                              <span key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, padding: "4px 10px", borderRadius: 4, background: `${CLUSTER_NAVY}80`, color: "#A5B4FC", border: `1px solid ${CLUSTER_NAVY}` }}>{ev}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============ TIMELINE ============ */}
        {activeTab === "Timeline" && (() => {
          const cutoff = getPDTMidnight();
          const sorted = [...PORTFOLIO.timeline].sort((a, b) => parseEventDatePDT(a.date) - parseEventDatePDT(b.date));
          const pastEvents = sorted.filter(t => parseEventDatePDT(t.date) < cutoff);
          const recentEvents = sorted.filter(t => parseEventDatePDT(t.date) >= cutoff);
          const renderEvent = (t, i) => {
            const typeColors = { filing: "#34D399", hearing: "#F472B6", ruling: "#60A5FA", event: "#94A3B8", milestone: GOLD };
            const col = typeColors[t.type] || "#94A3B8";
            const isUpcoming = t.upcoming && parseEventDatePDT(t.date) >= cutoff;
            return (
              <div key={i} style={{ position: "relative", marginBottom: 20, paddingLeft: 24 }}>
                <div style={{ position: "absolute", left: -26, top: 5, width: 12, height: 12, borderRadius: "50%", background: isUpcoming ? col : DARK_BG, border: `2px solid ${col}`, boxShadow: isUpcoming ? `0 0 12px ${col}60` : "none" }} />
                <div style={{ background: isUpcoming ? `${col}10` : CARD_BG, borderRadius: 8, padding: "12px 18px", border: isUpcoming ? `1px solid ${col}30` : `1px solid ${NAVY}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: col }}>{t.date}</span>
                      {isUpcoming && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, marginLeft: 8, padding: "1px 6px", borderRadius: 4, background: `${col}20`, color: col, fontWeight: 700 }}>UPCOMING</span>}
                    </div>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{t.type}</span>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#CBD5E1", margin: "6px 0 0", lineHeight: 1.5 }}>{t.event}</p>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B", marginTop: 4 }}>Matter {t.matters}</div>
                </div>
              </div>
            );
          };
          return (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "white", marginBottom: 24 }}>Procedural Timeline</h2>
              <div style={{ position: "relative", paddingLeft: 32 }}>
                <div style={{ position: "absolute", left: 11, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${GOLD}, ${NAVY})` }} />
                {/* Past events toggle */}
                <div style={{ position: "relative", marginBottom: 24, paddingLeft: 24 }}>
                  <div style={{ position: "absolute", left: -26, top: 10, width: 12, height: 12, borderRadius: "50%", background: DARK_BG, border: `2px solid #475569` }} />
                  <button onClick={() => setShowPastEvents(v => !v)} style={{
                    padding: "8px 16px", borderRadius: 6, border: `1px solid #475569`,
                    background: CARD_BG, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: 0.3
                  }}>
                    {showPastEvents ? `Hide past events (${pastEvents.length})` : `Show past events (${pastEvents.length})`}
                  </button>
                </div>
                {showPastEvents && pastEvents.map((t, i) => renderEvent(t, i))}
                {/* Jan 1, 2026 divider */}
                <div style={{ position: "relative", marginBottom: 24, paddingLeft: 24 }}>
                  <div style={{ position: "absolute", left: -30, top: "50%", transform: "translateY(-50%)", width: 20, height: 20, borderRadius: "50%", background: GOLD, border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center" }} />
                  <div style={{ borderTop: `1px dashed ${GOLD}40`, paddingTop: 8 }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: 1, textTransform: "uppercase" }}>Upcoming & Present</span>
                  </div>
                </div>
                {recentEvents.map((t, i) => renderEvent(t, i))}
              </div>
            </div>
          );
        })()}

        {/* ============ DAMAGES ============ */}
        {activeTab === "Damages" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "white", margin: 0 }}>Damages Analysis</h2>
              <div style={{ display: "flex", gap: 6 }}>
                {["conservative", "moderate", "aggressive"].map(v => (
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
                {formatCurrency(PORTFOLIO.damages_table.reduce((s, d) => s + d[damagesView], 0))}
                {damagesView === "aggressive" && <span style={{ fontSize: 28, color: GOLD }}>+</span>}
              </div>
            </div>

            {/* Breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PORTFOLIO.damages_table.map((d, i) => {
                const val = d[damagesView];
                const max = Math.max(...PORTFOLIO.damages_table.map(x => x.aggressive));
                const pct = (val / max) * 100;
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
              {["conservative", "moderate", "aggressive"].map(v => {
                const total = PORTFOLIO.damages_table.reduce((s, d) => s + d[v], 0);
                const isActive = v === damagesView;
                return (
                  <div key={v} onClick={() => setDamagesView(v)} style={{ background: isActive ? NAVY : CARD_BG, borderRadius: 10, padding: 20, border: isActive ? `1px solid ${GOLD}40` : `1px solid ${NAVY}`, cursor: "pointer", textAlign: "center", transition: "all 0.3s" }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: isActive ? GOLD : "#64748B", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{v}</div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: isActive ? "white" : "#94A3B8" }}>{formatCurrency(total)}{v === "aggressive" && "+"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============ THEORIES ============ */}
        {activeTab === "Theories" && (
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
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${NAVY}`, padding: "16px 32px", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#475569" }}>
        <span>Confidential — Attorney Work Product</span>
      </div>
    </div>
  );
}
