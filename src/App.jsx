import { useState } from "react";
import { NAVY, GOLD, BODY_GRAY, DARK_BG } from "./constants";
import { getPDTMidnight, parseEventDatePDT } from "./utils/dateUtils";
import { useDeadlineClock } from "./hooks/useDeadlineClock";
import { useCaseFilters } from "./hooks/useCaseFilters";

import { PORTFOLIO } from "./data";
import { DashboardTab } from "./components/DashboardTab";
import { MattersTab } from "./components/MattersTab";
import { TimelineTab } from "./components/TimelineTab";
import { DamagesTab } from "./components/DamagesTab";
import { TheoriesTab } from "./components/TheoriesTab";

const tabs = ["Dashboard", "Matters", "Timeline", "Damages", "Theories"];

export default function LitigationPortfolio() {
  const [activeTab, setActiveTab] = useState("Dashboard");
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

      {/* Deadline Clock Banner */}
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

      {/* Tab content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 60px" }}>
        {activeTab === "Dashboard" && <DashboardTab upcomingEvents={upcomingEvents} setClusterFilter={setClusterFilter} setActiveTab={setActiveTab} />}
        {activeTab === "Matters"   && <MattersTab filteredCases={filteredCases} clusterFilter={clusterFilter} setClusterFilter={setClusterFilter} typeFilter={typeFilter} setTypeFilter={setTypeFilter} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
        {activeTab === "Timeline"  && <TimelineTab showPastEvents={showPastEvents} setShowPastEvents={setShowPastEvents} />}
        {activeTab === "Damages"   && <DamagesTab damagesView={damagesView} setDamagesView={setDamagesView} />}
        {activeTab === "Theories"  && <TheoriesTab />}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${NAVY}`, padding: "16px 32px", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#475569" }}>
        <span>Confidential — Attorney Work Product</span>
      </div>
    </div>
  );
}
