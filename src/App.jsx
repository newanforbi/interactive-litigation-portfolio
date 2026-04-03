import { useState } from "react";
import { StatusBadge, ClusterBadge, TypeBadge } from "./components/Badges";
import { NAVY, GOLD, BODY_GRAY, CLUSTER_NAVY, BORDER_BLUE, DARK_BG, CARD_BG } from "./constants";
import { getPDTMidnight, parseEventDatePDT } from "./utils/dateUtils";
import { useDeadlineClock } from "./hooks/useDeadlineClock";
import { useCaseFilters } from "./hooks/useCaseFilters";

import { PORTFOLIO } from "./data";
import { DashboardTab } from "./components/DashboardTab";
import { TimelineTab } from "./components/TimelineTab";
import { DamagesTab } from "./components/DamagesTab";
import { TheoriesTab } from "./components/TheoriesTab";


const tabs = ["Dashboard", "Matters", "Timeline", "Damages", "Theories"];

export default function LitigationPortfolio() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [expandedMatter, setExpandedMatter] = useState(null);
  const { clusterFilter, setClusterFilter, typeFilter, setTypeFilter, searchQuery, setSearchQuery, filteredCases } = useCaseFilters();
  const [damagesView, setDamagesView] = useState("moderate");
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [showClock, setShowClock] = useState(false);

  const today = getPDTMidnight();
  const upcomingEvents = PORTFOLIO.timeline
    .filter(t => t.upcoming && parseEventDatePDT(t.date) >= today)
    .sort((a, b) => parseEventDatePDT(a.date) - parseEventDatePDT(b.date));

  const timeLeft = useDeadlineClock(upcomingEvents);

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
        {activeTab === "Dashboard" && <DashboardTab upcomingEvents={upcomingEvents} setClusterFilter={setClusterFilter} setActiveTab={setActiveTab} />}

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
        {activeTab === "Timeline" && <TimelineTab showPastEvents={showPastEvents} setShowPastEvents={setShowPastEvents} />}


        {/* ============ DAMAGES ============ */}
        {activeTab === "Damages" && <DamagesTab damagesView={damagesView} setDamagesView={setDamagesView} />}


        {/* ============ THEORIES ============ */}
        {activeTab === "Theories" && <TheoriesTab />}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${NAVY}`, padding: "16px 32px", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#475569" }}>
        <span>Confidential — Attorney Work Product</span>
      </div>
    </div>
  );
}
