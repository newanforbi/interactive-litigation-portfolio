import { useState } from "react";
import { PORTFOLIO } from "../data";
import { CARD_BG, NAVY, GOLD, BORDER_BLUE, CLUSTER_NAVY } from "../constants";
import { StatusBadge, ClusterBadge, TypeBadge } from "./Badges";

const MatterCard = ({ matter: c, isOpen, onToggle }) => (
  <div style={{ background: CARD_BG, borderRadius: 10, border: isOpen ? `1px solid ${GOLD}40` : `1px solid ${NAVY}`, overflow: "hidden", transition: "border-color 0.3s" }}>
    {/* Header row */}
    <div onClick={onToggle} style={{ padding: "16px 22px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
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

        {c.documents && c.documents.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Documents</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {c.documents.map((doc, i) => (
                <a key={i} href={doc.path} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, padding: "4px 10px", borderRadius: 4, background: `${NAVY}`, color: "#7DD3FC", border: `1px solid ${BORDER_BLUE}50`, textDecoration: "none" }}>{doc.label}</a>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

export const MattersTab = ({ filteredCases, clusterFilter, setClusterFilter, typeFilter, setTypeFilter, searchQuery, setSearchQuery }) => {
  const [expandedMatter, setExpandedMatter] = useState(null);

  return (
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
        {filteredCases.map(c => (
          <MatterCard
            key={c.number}
            matter={c}
            isOpen={expandedMatter === c.number}
            onToggle={() => setExpandedMatter(expandedMatter === c.number ? null : c.number)}
          />
        ))}
      </div>
    </div>
  );
};
