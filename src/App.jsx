import { useState, useMemo, useEffect } from "react";

const NAVY = "#1A2A49";
const GOLD = "#C8A84B";
const BODY_GRAY = "#495467";
const CLUSTER_NAVY = "#2B3D6B";
const BORDER_BLUE = "#CAD4DF";
const DARK_BG = "#0F1A2E";
const CARD_BG = "#162034";

// Deadline clock — counts down to Mar 28 2026 midnight PDT (Palacios federal default).
// Freezes at 00:00:00:00 until Apr 1 2026, then auto-advances to the next upcoming event.
const DEFAULT_DEADLINE = new Date("2026-03-28T00:00:00-07:00"); // midnight PDT Mar 28
const CLOCK_FREEZE_UNTIL = new Date("2026-04-01T00:00:00-07:00"); // midnight PDT Apr 1

// Returns midnight for a given date expressed in Pacific time (PDT/PST aware).
const getPDTMidnight = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(date);
  const y = parts.find(p => p.type === "year").value;
  const m = parts.find(p => p.type === "month").value;
  const d = parts.find(p => p.type === "day").value;
  // Determine current PT offset (PDT = UTC-7, PST = UTC-8)
  const tzLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles", timeZoneName: "short"
  }).formatToParts(date).find(p => p.type === "timeZoneName")?.value || "PDT";
  const offsetHrs = tzLabel === "PST" ? 8 : 7;
  return new Date(Date.UTC(+y, +m - 1, +d, offsetHrs, 0, 0));
};

// Parse a timeline date string (e.g. "Mar. 27, 2026") as midnight Pacific time.
const parseEventDatePDT = (dateStr) => {
  const temp = new Date(dateStr.replace(/\./g, ""));
  // Use same offset logic: all portfolio dates are in PDT (Mar–Oct 2026 = UTC-7)
  return new Date(Date.UTC(temp.getFullYear(), temp.getMonth(), temp.getDate(), 7, 0, 0));
};

const PORTFOLIO = {
  plaintiff: "Brendan Ngehsi Newanforbi",
  representation: "Pro Se / In Propria Persona",
  contact: { address: "1455 Cat Tail Drive, Stockton, CA 95204" },
  prepared_date: "March 15, 2026",
  jurisdictions: ["USDC E.D. Cal.", "San Joaquin Sup. Ct.", "Alameda Sup. Ct.", "Sacramento Sup. Ct.", "Santa Clara Sup. Ct."],
  cases: [
    {
      number: 1, caption: "Newanforbi v. CHP et al.", case_no: "2:25-cv-01460-DC-CSK", court: "USDC E.D. Cal.",
      claims: "42 USC 1983: 4A Search/Seizure, Due Process, Monell", status: "Filed 05/27/2025; MTD briefed",
      filed: "May 27, 2025", judge: "Hon. Dena M. Coggins", cluster: 1, type: "Federal",
      defendants: "State of California / CHP; Officer Santiago Meza-Gonzalez (#023295); Officer Jose Melano (#023054)",
      causes: ["Unreasonable Search and Seizure (4th Amend.)", "Violation of Due Process (14th Amend.)", "Monell Liability"],
      key_facts: "CHP officers encountered Plaintiff resting in a rented Tesla on I-580. Despite dashcam showing cup contained urine (not alcohol), officers arrested Plaintiff upon refusal of optional PAS test. DUI report fabricated observations of slurred speech and alcohol odor. No charges filed. 5-day parole hold.",
      procedural_status: "MTD briefed. Awaiting ruling.",
      damages: "$150,000 - $400,000+", risk: "Qualified immunity defense; dashcam evidence critical to defeat.",
      evidence: ["CHP Dashcam", "DUI Report", "Detention Certificate", "DMV Decision"]
    },
    {
      number: 2, caption: "Newanforbi v. Meza-Gonzalez et al.", case_no: "26CV168913", court: "Alameda Sup. Ct.",
      claims: "False Imprisonment, Battery, Bane Act", status: "Filed 02/04/2026; SERVICE NEEDED by ~04/05/2026",
      filed: "February 4, 2026", judge: "Hon. Marc Fickes", cluster: 1, type: "State",
      defendants: "Santiago Meza-Gonzalez; Jose Melano; State of California / CHP; DOES 1-10",
      causes: ["False Imprisonment", "Battery", "Bane Act (Civ. Code 52.1)"],
      key_facts: "Parallel state tort action from same Nov. 1, 2024 CHP encounter. Bane Act claim targets coerced waiver of PAS refusal right. Fabricated report constitutes independent wrongfulness.",
      procedural_status: "Filed 02/04/2026. Fee Waiver Hearing 03/03/2026. CMC 07/06/2026. SERVICE DEADLINE: Summons expires ~04/05/2026 (60 days). Must serve Meza-Gonzalez, Melano, and State of California/CHP.",
      damages: "$100,000 - $300,000+", risk: "",
      evidence: ["Same as Matter 1", "State procedural records"]
    },
    {
      number: 3, caption: "Newanforbi v. Derrick et al.", case_no: "2:26-cv-00004-DJC-JDP", court: "USDC E.D. Cal.",
      claims: "42 USC 1983: 1A Retaliation, 14A Equal Protection, Due Process", status: "Active; Palacios FEDERAL DEFAULT — answer deadline 03/27/2026 passed without appearance",
      filed: "January 5, 2026", judge: "Hon. Daniel J. Calabretta / Mag. Peterson", cluster: 2, type: "Federal",
      defendants: "Agent Derrick (#6910); Katie Palacios; G. Noguchi; Jeff Macomber",
      causes: ["First Amendment Retaliation", "Equal Protection (race-based)", "Substantive Due Process"],
      key_facts: "Derrick told Plaintiff: 'You do not have freedom of speech. Not in HOPE group you don't.' Escalating retaliation: FedEx employment sabotage ($20/hr), pretextual violations, witness interference (Huybers visit Jan. 15, 2026). Sworn declarations from white and Black comparator parolees.",
      procedural_status: "Ex Parte Motion filed. FAC filed. Mar. 19, 2026: Motion Hearings (Docs 9 & 14). Mar. 27, 2026: Palacios answer deadline PASSED — no Answer, MTD, or appearance filed by SLB or any counsel. SLB retained for state case (STK-CV-UF-2026-1032) only; written record (subject line, POS-015 form, state claims) confirms extension does not extend to federal matter. Palacios technically in default as of 03/28/2026. Next step: PACER check Mar. 30; meet-and-confer email to Malone/Schmitt; Rule 55(a) RFED to file by Apr. 1, 2026 at 5:00 PM if no response.",
      damages: "$250,000 - $750,000+", risk: "Qualified immunity; strong factual support including recordings and declarations.",
      evidence: ["HOPE Recordings", "Beard Declaration", "Huybers Declaration", "FedEx Records", "Form 1502-DR"]
    },
    {
      number: 4, caption: "Newanforbi v. Derrick et al.", case_no: "TBD", court: "San Joaquin Sup. Ct.",
      claims: "IIED, Bane Act, Intentional/Negligent Econ. Interference, Negligent Supervision, NIED", status: "Filed 05/29/2026",
      filed: "May 29, 2026", judge: "TBD", cluster: 2, type: "State",
      defendants: "Andrew Jackson Derrick (individually); Gary Noguchi (individually); State of California / CDCR; DOES 1-20",
      causes: ["IIED", "Bane Act (Civ. Code §52.1)", "Intentional Interference w/ Econ. Adv.", "Negligent Interference w/ Econ. Adv.", "Negligent Supervision", "NIED"],
      key_facts: "State law parallel to Matter 3. Bane Act claim based on Derrick's speech suppression threats and witness intimidation. Intentional and negligent economic interference: documented FedEx relationship ($20/hr) destroyed. Negligent supervision: Noguchi had actual knowledge of retaliation and failed to intervene. CDCR vicariously liable under §815.2(a). Must file within 6 months of deemed rejection (~Sep. 2026).",
      procedural_status: "Filed 05/29/2026. Gov. Claim filed Feb. 2026; deemed rejected ~Apr. 2026. Filed well within 6-month suit deadline (Gov. Code §945.6(a)(1)).",
      damages: "$200,000 - $500,000+", risk: "Discretionary immunity argument; ministerial duties exception applies.",
      evidence: ["Same as Matter 3", "Gov. Claim documentation"]
    },
    {
      number: 5, caption: "Newanforbi v. Palacios et al.", case_no: "STK-CV-UF-2026-0001032", court: "San Joaquin Sup. Ct.",
      claims: "Fraud, Negligence, False Imprisonment, IIED, Econ. Interference", status: "Active — Palacios response extended to 04/27/2026 (SLB stipulation, state case only); HOPE service pending",
      filed: "February 10, 2026", judge: "Hon. George J. Abdallah", cluster: 2, type: "State",
      defendants: "HOPE Psychotherapy Inc.; Katie Palacios; DOES 1-10",
      causes: ["Fraud / Misrepresentation", "Negligence", "False Imprisonment", "IIED", "Economic Interference"],
      key_facts: "Targets HOPE as private defendant — no gov. claim required. Blanket retention policy admitted under oath in Dwyer. Fee-for-service billing ($85/group, $600/polygraph) creates ~$9,690/year incentive to retain. No qualified immunity.",
      procedural_status: "Filed 02/10/2026. Fee waiver approved. Summons issued. CMC 10/13/2026. Katie Palacios personally served 02/24/2026 (SJC Sheriff); POS-010 filed 03/03/2026; original response due 03/26/2026. Sims, Lawrence & Broghammer contacted 03/27/2026 and requested 30-day extension — stipulated to Apr. 27, 2026 (state case only; written record tethered exclusively to STK-CV-UF-2026-1032 and state tort claims; does NOT extend to federal matter 2:26-cv-00004-DJC-JDP). SERVICE STILL NEEDED: HOPE Psychotherapy, Inc. (packet mailed to Alameda Sheriff 02/25/2026; follow up required; summons expires ~04/11/2026).",
      damages: "$250,000 - $750,000+", risk: "Key advantage: no qualified/sovereign immunity for private defendant.",
      evidence: ["Dwyer order", "Alameda Contract billing rates", "Form 1502-DR", "CTM records", "HOPE billing"]
    },
    {
      number: 6, caption: "Newanforbi v. HOPE et al.", case_no: "2:26-cv-00195-TLN-AC", court: "USDC E.D. Cal.",
      claims: "42 USC 1983: Procedural Due Process (Discharge Review)", status: "Filed 01/22/2026",
      filed: "January 22, 2026", judge: "Hon. Troy L. Nunley / Mag. Claire", cluster: 2, type: "Federal",
      defendants: "HOPE Psychotherapy Inc.; Katie Palacios; Macomber; Bishop; Dodd; Moua; Noguchi; Derrick; Rojo",
      causes: ["Procedural Due Process (14th Amend.) — Systemic challenge to discharge review framework"],
      key_facts: "Broadest systemic challenge. Defendants fabricated '10-year parole term' ineligibility rule. HOPE's blanket retention policy judicially condemned in Dwyer. Discharge Review Report facially defective. Targets entire discharge review apparatus.",
      procedural_status: "Filed 01/22/2026. Early stage.",
      damages: "$250,000 - $750,000+", risk: "HOPE state actor argument; West v. Atkins supports delegated function theory.",
      evidence: ["HOPE billing docs", "Alameda Contract", "Dwyer decision", "BCP Fiscal Detail", "Form 1502-DR"]
    },
    {
      number: 7, caption: "Newanforbi v. Candelaria", case_no: "TBD (USDC E.D. Cal.)", court: "USDC E.D. Cal.",
      claims: "42 USC 1983: Procedural Due Process (DMV APS Structural Bias)", status: "Filed 05/29/2026",
      filed: "May 29, 2026", judge: "TBD", cluster: 1, type: "Federal",
      defendants: "Diana Candelaria, DMV Hearing Officer (individual capacity)",
      causes: ["Procedural Due Process (14th Amend.) — Structural bias; simultaneous prosecutor/adjudicator; irrebuttable presumption of official regularity"],
      key_facts: "Candelaria sustained one-year CDL suspension and commercial disqualification despite: (1) CHP's own Detention Certificate under PC §849(b)(1) formally repudiating the arrest; (2) no criminal charges ever filed; (3) dashcam contradicting DS-367 on material points. Structural bias: Candelaria served simultaneously as prosecutor and adjudicator — condemned in California DUI Lawyers Ass'n and Knudsen v. DMV. Applied irrebuttable presumption of official regularity; refused to address Detention Certificate or binding Mercer v. DMV precedent; issued conclusory decision dismissing arguments as 'unpersuasive' without analysis. APS hearing Jan. 24, 2025; decision Feb. 11, 2025 (Case 34739340). Qualified immunity rebutted by clearly established law (Bell v. Burson, Mathews v. Eldridge, Knudsen).",
      procedural_status: "Filed 05/29/2026. APS hearing Jan. 24, 2025. Decision Feb. 11, 2025 (Case 34739340).",
      damages: "$150,000 - $400,000+", risk: "Qualified immunity — rebutted by clearly established law (Bell v. Burson, Mathews v. Eldridge, Knudsen v. DMV). Structural error doctrine may not require showing of prejudice.",
      evidence: ["CHP Detention Certificate (PC §849(b)(1))", "DMV DS-367", "CHP Dashcam", "APS Decision (Case 34739340)", "California DUI Lawyers Ass'n decision", "Knudsen v. DMV", "Mercer v. DMV", "Centerline CDL earnings records"]
    },
    {
      number: 8, caption: "Newanforbi v. DMV / Candelaria", case_no: "TBD (San Joaquin Sup. Ct.)", court: "San Joaquin Sup. Ct.",
      claims: "Admin. Mandamus, Due Process, §1983, Bane Act, Mandatory Duty, Declaratory Relief", status: "Filed 05/29/2026",
      filed: "May 29, 2026", judge: "TBD", cluster: 1, type: "State",
      defendants: "State of California / DMV; Steve Gordon, Director (official capacity); Diana Candelaria (individual capacity)",
      causes: ["Writ of Administrative Mandamus (CCP §1094.5)", "Due Process (Cal. Const. Art. I §7)", "42 USC §1983", "Tom Bane Civil Rights Act (§52.1)", "Breach of Mandatory Duty (Gov. Code §815.6)", "Declaratory Relief (CCP §1060)"],
      key_facts: "Combined verified petition for writ of administrative mandamus and complaint for damages arising from same APS hearing. Broader defendant roster: DMV, Director Steve Gordon (official capacity), and Candelaria (individual capacity). Seeks both equitable relief (set aside suspension, restore CDL) and compensatory damages including Bane Act treble damages. Same core APS facts as Matter 7: Detention Certificate ignored, structural bias, CDL commercially disqualified. CDL loss triggered cascading harm: unemployment → Nov. 2025 Discharge Review cites unemployment as aggravating factor to deny discharge.",
      procedural_status: "Filed 05/29/2026. Gov. Claims Act compliance required before suing State/DMV (§900 et seq.). Gov. claim to be presented to DGS prior to filing.",
      damages: "$200,000 - $500,000+", risk: "§820.2 immunity for Candelaria's adjudicatory function — rebutted by structural bias doctrine. DMV sovereign immunity partially waived by CCP §1094.5. Bane Act provides independent damages hook against Candelaria individually.",
      evidence: ["Same as Matter 7", "DMV administrative record", "Steve Gordon Director documentation", "Gov. Claim (upon presentment)"]
    },
    {
      number: 9, caption: "Newanforbi v. Macomber", case_no: "26WM000028", court: "Sacramento Sup. Ct.",
      claims: "Writ of Mandate (CCP §1085)", status: "Filed 01/30/2026; Hearing 03/27/2026",
      filed: "January 30, 2026", judge: "Hon. James P. Arguelles", cluster: 2, type: "State",
      defendants: "Jeff Macomber, Secretary of CDCR",
      causes: ["Writ of Mandate (CCP §1085) — Compel ministerial duty to conduct individualized discharge determination"],
      key_facts: "Challenges November 2025 Discharge Review decision. CDCR abused discretion: facial scoring errors in Form 1502-DR, retaliatory input from compromised agents, wrong legal standard, blanket denial based on treatment non-completion.",
      procedural_status: "Opening Brief filed. Hearing 03/27/2026, Dept. 32.",
      damages: "Equitable: Vacate denial; order new review or discharge", risk: "",
      evidence: ["Admin. Record", "Form 1502-DR", "Opening Brief"]
    },
    {
      number: 10, caption: "Newanforbi v. Macomber", case_no: "C2602632", court: "Santa Clara Sup. Ct.",
      claims: "Habeas Corpus (PC §3008(d)(2); 15 CCR §3574) — Treatment Termination", status: "Filed 02/23/2026",
      filed: "February 23, 2026", judge: "TBD", cluster: 2, type: "State",
      defendants: "Jeffrey Macomber, Secretary of CDCR (official capacity)",
      causes: ["PC §3008(d)(2)", "15 CCR §3574", "Challenge to compelled treatment as unlawful restraint"],
      key_facts: "On parole since Dec. 2020. Over 5 years of sex offender treatment. No new convictions, no revocations, low risk. Repeated clinician turnover and administrative resets. No good-cause finding issued for continued retention.",
      procedural_status: "Filed 02/23/2026 (Case No. C2602632). Proof of service on AG and DA. Awaiting OSC.",
      damages: "Equitable: Immediate termination of treatment", risk: "Habeas vehicle challenge; admin. exhaustion argument.",
      evidence: ["Form 1502-DR", "CSRA score docs", "Compliance history", "15 CCR 3574"]
    },
    {
      number: 11, caption: "Newanforbi v. Macomber", case_no: "TBD (USDC E.D. Cal.)", court: "USDC E.D. Cal.",
      claims: "42 USC 1983: Procedural Due Process (Policy 19-03)", status: "Filed 03/02/2026",
      filed: "March 2, 2026", judge: "TBD", cluster: 2, type: "Federal",
      defendants: "Jeff Macomber, Secretary of CDCR (official capacity only)",
      causes: ["Procedural Due Process (14th Amend.) — Policy 19-03 challenge; declaratory/injunctive relief under Ex parte Young"],
      key_facts: "Challenges CDCR's enforcement of Policy 19-03's categorical 6.5-year bar after Section 3574 adoption (April 2025). Noguchi cited Policy 19-03 as sole basis: 'only completed approximately 4 years of the required 6.5 years.' No Section 3574 analysis. LS/CMI 5 vs. threshold 11. Form 602 exhausted through 3 levels. Equitable relief only.",
      procedural_status: "Filed 03/02/2026. Early stage.",
      damages: "Equitable: Declaratory judgment; permanent injunction; de novo review; DAPO training order; §1988 fees", risk: "Heck v. Humphrey (addressed via Wilkinson v. Dotson); abstention arguments (distinguished).",
      evidence: ["Form 1502-DR", "Policy 19-03", "Section 3574/NCR 25-01", "Form 602 grievance", "LS/CMI documentation", "Dwyer/ACSOL decisions"]
    },
    {
      number: 12, caption: "Ngwa Nforbi v. Diamond Truck Sales", case_no: "STK-CV-UF-2026-0001094", court: "San Joaquin Sup. Ct.",
      claims: "Fraud, Breach of Contract, UCL (B&P 17200), Rescission", status: "Active — Diamond Truck Sales served 03/11/2026; POS filed; response due 04/10/2026",
      filed: "February 13, 2026", judge: "Hon. Robert T. Waters", cluster: 3, type: "State",
      defendants: "Diamond Truck Sales Inc. (Texas); Dakota Financial LLC (California); DOES 1-25",
      causes: ["Fraudulent Concealment", "Intentional Misrepresentation", "Negligent Misrepresentation", "Breach of Contract", "UCL Violation", "Rescission", "Declaratory Relief"],
      key_facts: "Purchased 2014 Volvo VNL for $26,900. Diamond concealed DEF/emissions defect and prior CHP out-of-service. Truck entered catastrophic derate mode — unable to exceed 35 mph.",
      procedural_status: "Filed 02/13/2026. Fee waiver approved. Summons issued. CMC 08/12/2026. Diamond Truck Sales Inc. served 03/11/2026; POS filed 03/11/2026; response due 04/10/2026. Dakota Financial LLC — service still needed.",
      damages: "$75,000 - $150,000+", risk: "Diamond is Texas corp.; service/jurisdiction issues. Dakota is CA-based.",
      evidence: ["Buyer's Order", "Dakota financing agreement", "Emissions records", "CHP out-of-service docs"]
    },
    {
      number: 13, caption: "Newanforbi v. Urrea et al.", case_no: "2:26-cv-00190-DC-SCR", court: "USDC E.D. Cal.",
      claims: "42 USC 1983: Unconstitutional Detention (Halloween Curfew)", status: "Filed 01/22/2026",
      filed: "January 22, 2026", judge: "Hon. Dena M. Coggins / Mag. Riordan", cluster: 2, type: "Federal",
      defendants: "Agent Urrea; Jeff Macomber; G. Noguchi",
      causes: ["4th & 14th Amendment Violations — Unconstitutional Detention"],
      key_facts: "Agent Urrea exploited pretextual Halloween curfew to detain Plaintiff for 5 days. No nexus to commitment offense. No individualized assessment, notice, hearing, or judicial oversight.",
      procedural_status: "Filed 01/22/2026. Early stage.",
      damages: "$100,000 - $250,000+", risk: "",
      evidence: ["Detention records", "Parole conditions", "Lack of nexus documentation"]
    },
    {
      number: 14, caption: "Newanforbi v. Urrea et al.", case_no: "TBD (San Joaquin Sup. Ct.)", court: "San Joaquin Sup. Ct.",
      claims: "False Imprisonment, Bane Act, IIED, Negligent Supervision", status: "Filed 05/29/2026",
      filed: "May 29, 2026", judge: "TBD", cluster: 2, type: "State",
      defendants: "Glenn Urrea, Parole Agent (individually); Gary Noguchi (#7284), Unit Supervisor (individually); Keely Dodd (#6462), Parole Administrator (individually); State of California / CDCR; DOES 1-10",
      causes: ["False Imprisonment", "Bane Act (Civ. Code §52.1)", "IIED", "Negligent Supervision (against CDCR)"],
      key_facts: "State tort parallel to federal Matter 13. On Nov. 1, 2024, at the precise moment Plaintiff was eligible for release from Santa Rita Jail on the DUI detention, Agent Urrea placed a parole hold based on Special Condition 063 — a Halloween curfew ('Operation Boo') categorically applied without individualized nexus to Plaintiff's adult-victim commitment offense. Five days of arbitrary imprisonment. No written notice, no hearing, no neutral decision-maker. Housed with dangerous cellmate; transported to holding tank for court appearance that never occurred; released only after bail bond company intervened. Cascading harm: arrest triggered DMV APS suspension (Dec. 4, 2024), CDL commercially disqualified, lost Centerline Drivers employment on his first scheduled shift. Ongoing lost wages: $104,000–$143,620 over ~65 weeks ($1,600–$2,209/week). Nov. 2025 Discharge Review cited Plaintiff's unemployment — caused by Defendants' own conduct — as aggravating factor to deny discharge. Condition 063 reaffirmed in Aug. 2025 update, demonstrating systemic practice.",
      procedural_status: "Filed 05/29/2026. Gov. Claim presented 03/02/2026; deemed rejected 05/15/2026. Filed within 6-month suit deadline (Gov. Code §945.6(a)(1)).",
      damages: "$200,000 - $500,000+", risk: "§820.2 immunity — rebutted: condition approval and hold placement are ministerial acts under CDCR's own nexus requirements, not discretionary policy. Bane Act treble damages. Dodd as managing agent supports entity punitive damages.",
      evidence: ["Detention records (Santa Rita)", "Special Condition 063 + Reason Code 08", "CHP Detention Certificate", "DMV APS Decision (Case 34739340)", "Centerline paystubs ($33.35/$50.03)", "Form 1502-DR (unemployment as aggravating factor)", "Aug. 2025 updated conditions (reaffirmation)"]
    },
    {
      number: 15, caption: "Newanforbi v. Moua et al.", case_no: "TBD (San Joaquin Sup. Ct.)", court: "San Joaquin Sup. Ct.",
      claims: "Mandatory Duty Breach, False Imprisonment, IIED, Econ. Interference", status: "Filed 05/29/2026",
      filed: "May 29, 2026", judge: "TBD", cluster: 2, type: "State",
      defendants: "Long Moua (#7472); Gary Noguchi (#7284); Keely Dodd (#6462); Andrew Derrick (#6910); Joseelyn Rojo; CDCR; DOES 1-20",
      causes: ["Breach of Mandatory Duty (§815.6)", "False Imprisonment", "IIED", "Intentional Interference with Economic Advantage"],
      key_facts: "Attacks the Nov. 2025 Discharge Review itself — ten documented facial defects: (a) Case Type contradiction (PC 3000(b)(5)(B) vs '10-year term'); (b) fabricated 6.5-year minimum from academic research (Cortoni et al. 2010), not statute; (c) fabricated Policy 19-03 exclusion; (d) 'Eagan' copy-paste error — Noguchi's review names a different parolee, proving no individualized review; (e) contradictory treatment characterizations; (f) scoring without aggregation (14 pts = 'Increase' band, yet 'Retain'); (g) violations from unpromulgated GPS protocol (underground regulation); (h) failure to weigh mitigating evidence (LS/CMI 5, Noguchi's own commendation); (i) no CTM, Form 3043, or good-cause findings; (j) report never served (notice field blank). W-2 documented earnings from 6 carriers: $39,553 (2022), $11,145 (2023), $55,894 (2024). But-for capacity: $72,000/year. Documented lost wages: $109,408.",
      procedural_status: "Filed 05/29/2026. Gov. claim deemed rejected 03/27/2026 (§912.4(c)). Jury trial demanded. Filed within 6-month suit deadline (Gov. Code §945.6(a)(1)).",
      damages: "$250,000 - $600,000+", risk: "§820.2 discretionary immunity — rebutted by mandatory/ministerial duties under PC §3001(a)(2) and §3574 (Johnson v. State, Sullivan v. County of LA). 'Eagan' error is uniquely powerful proof. Continuing tort: each day = separate act.",
      evidence: ["Form 1502-DR (10 defects)", "W-2 wage statements (6 carriers)", "Centerline wage notice ($33.35/$50.03)", "Dwyer order", "ACSOL v. Macomber ruling", "Section 3574/NCR 25-01", "Gov. Claim + deemed rejection"]
    },
    {
      number: 16, caption: "Newanforbi v. Rojo", case_no: "2:26-cv-00193-DC-CKD", court: "USDC E.D. Cal.",
      claims: "42 USC 1983: Civil Rights", status: "Filed 01/22/2026",
      filed: "January 22, 2026", judge: "Hon. Dena M. Coggins / Mag. Delaney", cluster: 2, type: "Federal",
      defendants: "Joseelyn Rojo, Parole Agent, CDCR",
      causes: ["Civil Rights Violation (42 USC 1983)"],
      key_facts: "Agent Rojo assumed AOR on Nov. 19, 2025 and withheld finalized Discharge Review Report from Plaintiff. Perpetuated unlawful retention.",
      procedural_status: "Filed. Early stage.",
      damages: "TBD", risk: "",
      evidence: ["Discharge Review Report", "Non-disclosure records"]
    },
    {
      number: 17, caption: "Newanforbi v. Maloney et al.", case_no: "2:26-cv-00194-DAD-SCR", court: "USDC E.D. Cal.",
      claims: "42 USC 1983: Civil Rights", status: "Filed 01/22/2026",
      filed: "January 22, 2026", judge: "Hon. Dale A. Drozd / Mag. Riordan", cluster: 2, type: "Federal",
      defendants: "J. Maloney (#59491); Jeff Macomber (official capacity)",
      causes: ["Civil Rights Violation", "Declaratory and Injunctive Relief"],
      key_facts: "Maloney sued individually for parole supervision violations. Macomber sued officially for declaratory/injunctive relief to halt unconstitutional parole term enforcement.",
      procedural_status: "Filed 01/22/2026. Early stage.",
      damages: "$50,000 - $200,000+", risk: "",
      evidence: ["Parole records", "Supervision documentation"]
    },
    {
      number: 18, caption: "Newanforbi v. Barocio", case_no: "2:26-cv-00191-DJC-CSK", court: "USDC E.D. Cal.",
      claims: "42 USC 1983: Civil Rights", status: "Filed 01/22/2026",
      filed: "January 22, 2026", judge: "Hon. Daniel J. Calabretta / Mag. Kim", cluster: 2, type: "Federal",
      defendants: "Barocio, Parole Agent / Official, CDCR",
      causes: ["Civil Rights Violation (42 USC 1983)"],
      key_facts: "Actions by Barocio in connection with parole supervision. Part of broader pattern of constitutional violations by CDCR agents.",
      procedural_status: "Filed. Early stage.",
      damages: "TBD", risk: "",
      evidence: ["Parole supervision records"]
    }
  ],
  timeline: [
    { date: "Dec. 2, 2020", event: "Released on parole; HOPE Program begins", matters: "All", type: "milestone" },
    { date: "Apr. 4, 2023", event: "Purchased defective Volvo semi-truck from Diamond", matters: "12", type: "event" },
    { date: "Mar. 2023", event: "In re Dwyer: Court condemns HOPE blanket retention policy", matters: "9,6,5,11,15", type: "ruling" },
    { date: "Dec. 2023", event: "ACSOL v. Macomber: Demurrer overruled", matters: "9,6,5,11", type: "ruling" },
    { date: "Nov. 1, 2024", event: "CHP stop on I-580; DUI arrest; 5-day parole hold", matters: "1,2,13,14", type: "event" },
    { date: "Dec. 4, 2024", event: "DMV issues APS suspension notice following CHP arrest; CDL commercially disqualified", matters: "7,8", type: "event" },
    { date: "Jan. 2025", event: "Derrick assigned; suppresses freedom of speech", matters: "3,4", type: "event" },
    { date: "Jan. 24, 2025", event: "DMV APS Hearing before Candelaria — Detention Certificate ignored; structural bias; irrebuttable presumption applied", matters: "7,8", type: "hearing" },
    { date: "Feb. 11, 2025", event: "Candelaria sustains one-year CDL suspension (Case 34739340); conclusory decision dismisses Detention Certificate and Mercer precedent", matters: "7,8", type: "event" },
    { date: "Mar.–Apr. 2025", event: "FedEx employment sabotaged; forced resignation", matters: "3,4", type: "event" },
    { date: "Apr. 2025", event: "Section 3574 takes effect; supersedes Policy 19-03", matters: "9,6,5,11", type: "ruling" },
    { date: "May 27, 2025", event: "Federal CHP complaint filed", matters: "1", type: "filing" },
    { date: "Mid-2025", event: "Palacios labels Plaintiff 'ringleader'", matters: "3,4,5", type: "event" },
    { date: "Nov. 14–19, 2025", event: "Discharge Review: Noguchi cites Policy 19-03; 'Eagan' copy-paste error; unemployment (caused by Defendants) cited as aggravating factor", matters: "9,3,6,10,11,15,14", type: "event" },
    { date: "Dec. 2, 2025", event: "Five-year statutory minimum expires", matters: "9,10", type: "milestone" },
    { date: "Dec. 2025", event: "Form 602 grievance exhausted (3 levels)", matters: "11", type: "event" },
    { date: "Jan. 5, 2026", event: "Federal Complaint (Derrick) filed", matters: "3", type: "filing" },
    { date: "Jan. 15, 2026", event: "Derrick visits witness Huybers", matters: "3,4", type: "event" },
    { date: "Jan. 22, 2026", event: "4 federal complaints filed (Urrea, HOPE, Maloney, Barocio)", matters: "13,6,17,18", type: "filing" },
    { date: "Jan. 30, 2026", event: "Writ of Mandamus filed, Sacramento", matters: "9", type: "filing" },
    { date: "Feb. 4, 2026", event: "State tort filed, Alameda", matters: "2", type: "filing" },
    { date: "Feb. 10, 2026", event: "HOPE/Palacios state tort filed (STK-CV-UF-2026-1032)", matters: "5", type: "filing" },
    { date: "Feb. 13, 2026", event: "Diamond Truck Sales complaint filed", matters: "12", type: "filing" },
    { date: "Feb. 23, 2026", event: "Habeas corpus petition filed in Santa Clara (Case No. C2602632)", matters: "10", type: "filing" },
    { date: "Feb. 24, 2026", event: "Katie Palacios personally served (SJC Sheriff); POS-010 to be filed", matters: "5", type: "event" },
    { date: "Mar. 2, 2026", event: "Federal Policy 19-03 challenge filed; Gov. Claim mailed for Policy 19-03 state tort", matters: "11", type: "filing" },
    { date: "Mar. 2, 2026", event: "Gov. Claim presented — Urrea state tort (45-day clock begins)", matters: "14", type: "filing" },
    { date: "Mar. 3, 2026", event: "Fee Waiver Hearing, Alameda (Hayward) — Completed; POS-010 for Palacios filed", matters: "2,5", type: "hearing" },
    { date: "Mar. 9, 2026", event: "Palacios POS-015 executed — federal case (Sims, Lawrence & Broghammer confirmed service)", matters: "3", type: "event" },
    { date: "Mar. 11, 2026", event: "Diamond Truck Sales served; POS filed (03/11/2026)", matters: "12", type: "event" },
    { date: "Mar. 19, 2026", event: "Motion Hearings (Docs 9 & 14) at 10:00 AM — Judge Calabretta (Motion to Quash + related)", matters: "3", type: "hearing" },
    { date: "Mar. 27, 2026", event: "Answer due — Palacios FAC (Doc 5); deadline PASSED without appearance. SLB retained for state case only. Palacios in federal default as of 03/28/2026.", matters: "3", type: "event" },
    { date: "Mar. 30, 2026", event: "PACER verification — check federal docket for 2:26-cv-00004-DJC-JDP; send meet-and-confer email to Malone/Schmitt re: federal representation and missed deadline", matters: "3", type: "filing", upcoming: true },
    { date: "Apr. 1, 2026", event: "Courtesy deadline (5:00 PM) — SLB must confirm federal representation or responsive pleading intentions; Rule 55(a) Request for Entry of Default to be filed against Palacios if no response", matters: "3", type: "milestone", upcoming: true },
    { date: "Apr. 27, 2026", event: "Katie Palacios response deadline — state tort (extended per SLB stipulation; applies to STK-CV-UF-2026-1032 only; does NOT cover federal matter 2:26-cv-00004-DJC-JDP)", matters: "5", type: "filing", upcoming: true },
    { date: "May 15, 2026", event: "Gov. claims deemed rejected (§912.4(c)) — Urrea, Moua, Candelaria, and Derrick state torts", matters: "4,15,14,7,8", type: "event", upcoming: true },
    { date: "May 29, 2026", event: "Mandamus Hearing, Sacramento, Dept. 32", matters: "9", type: "hearing", upcoming: true },
    { date: "May 29, 2026", event: "Complaints filed — Derrick State Tort, Urrea State Tort, Moua State Tort, Candelaria §1983 (Federal), Candelaria/DMV State Tort", matters: "4,15,14,7,8", type: "filing", upcoming: true },
    { date: "Apr. 7, 2026", event: "Service deadline — all defendants Meza-Gonzalez (60 days from filing, Cal. Rules of Court 3.110(b))", matters: "2", type: "filing", upcoming: true },
    { date: "Apr. 9, 2026", event: "Opt-out declination due — Derrick Federal (Doc 20, filed 03/10/2026)", matters: "3", type: "filing", upcoming: true },
    { date: "Apr. 10, 2026", event: "Service deadline — HOPE Psychotherapy, Inc. (packet mailed to Alameda Sheriff 02/25/2026; follow up required)", matters: "5", type: "filing", upcoming: true },
    { date: "Apr. 10, 2026", event: "Diamond Truck Sales response deadline (30 days from 03/11/2026 service)", matters: "12", type: "filing", upcoming: true },
    { date: "Mar. 26, 2026", event: "Katie Palacios state response deadline (STK-CV-UF-2026-1032); SLB contacted 03/27 requesting 30-day extension — stipulated to Apr. 27, 2026 (state case only)", matters: "5", type: "filing" },
    { date: "Jun. 1, 2026", event: "Gov. claim accrual deadline — Derrick & Urrea state torts (6 months from Dec. 1, 2025 accrual; claims already filed)", matters: "4,14", type: "filing", upcoming: true },
    { date: "Jun. 3, 2026", event: "Case Management Statement (CM-110) due — Meza-Gonzalez; meet-and-confer (Rule 3.724); post jury fees (CCP §631)", matters: "2", type: "filing", upcoming: true },
    { date: "Jun. 18, 2026", event: "Motion Hearing — I-918 Supp. B Certification, 2:30 PM, Dept. 518, Hayward Hall of Justice", matters: "2", type: "hearing", upcoming: true },
    { date: "Jul. 6, 2026", event: "Case Management Conference, 2:30 PM, Dept. 518, Hayward — Judge Mark Fickes", matters: "2", type: "hearing", upcoming: true },
    { date: "Aug. 12, 2026", event: "CMC, San Joaquin Superior Court", matters: "12", type: "hearing", upcoming: true },
    { date: "Aug. 19, 2026", event: "Gov. claim deadline — Candelaria state tort Bane Act damages (6 months from Feb. 19, 2026 accrual; claim must be filed with DGS)", matters: "7,8", type: "filing", upcoming: true },
    { date: "Sep. 27, 2026", event: "Suit filing deadline — Moua state tort (6 months from 03/27/2026 deemed rejection per Gov. Code §945.6(a)(1))", matters: "15", type: "filing", upcoming: true },
    { date: "Oct. 10, 2026", event: "Suit filing deadline — Derrick state tort (est. 6 months from ~04/10/2026 deemed rejection)", matters: "4", type: "filing", upcoming: true },
    { date: "Oct. 13, 2026", event: "CMC, San Joaquin Superior Court", matters: "5", type: "hearing", upcoming: true },
    { date: "Oct. 16, 2026", event: "Suit filing deadline — Urrea state tort (est. 6 months from ~04/16/2026 deemed rejection per Gov. Code §945.6)", matters: "14", type: "filing", upcoming: true }
  ],
  theories: [
    { id: 1, title: "First Amendment Retaliation as the Catalyst", matters: "3,4", icon: "🗣️", desc: "Derrick's 'no freedom of speech' statement triggered the cascade. Satisfies Rhodes v. Robinson chilling effect test." },
    { id: 2, title: "HOPE Program Structural Incentive Misalignment", matters: "6,5", icon: "💰", desc: "Fee-for-service billing (~$9,690/yr per parolee) with no completion bonus creates perverse retention incentive. Condemned in Dwyer and Macomber." },
    { id: 3, title: "Race-Based Disparate Treatment", matters: "3,4", icon: "⚖️", desc: "Sworn declarations from white comparator (favorable treatment) and Black parolee (hostile treatment) under same agent. CHP encounter adds additional dimension." },
    { id: 4, title: "Compounding Constitutional Harms", matters: "All", icon: "🔗", desc: "Retaliation → unemployment → retention basis → continued custody → prevented employment. Each matter reinforces others." },
    { id: 5, title: "Post-Notice Continuation (Punitive Damages)", matters: "All CDCR", icon: "⚠️", desc: "Defendants continued conduct after Dwyer (2023), Macomber (2023), and April 2025 amendments. Demonstrates conscious disregard under Civ. Code 3294." },
    { id: 7, title: "Facially Defective Discharge Review as Independent Tort", matters: "15", icon: "📋", desc: "The 'Eagan' copy-paste error proves no individualized review occurred. The fabricated 6.5-year minimum traces to academic research (Cortoni et al.), not statute — an underground regulation. W-2 documented $109,408 in lost wages from 6 CDL carriers provides the strongest quantified damages foundation in the portfolio." },
    { id: 8, title: "DMV Structural Bias and CDL Destruction", matters: "7,8", icon: "🚗", desc: "DMV hearing officer Candelaria operated within a structurally biased framework (simultaneous prosecutor/adjudicator). CHP's own Detention Certificate under PC §849(b)(1) repudiated the arrest, yet Candelaria sustained the suspension applying an irrebuttable presumption of official regularity. Connects Cluster 1 (CHP encounter) to Cluster 2 (CDL loss → unemployment → discharge denial)." },
    { id: 9, title: "Policy 19-03 as Ultra Vires Administrative Action", matters: "11", icon: "📜", desc: "Policy 19-03 is affirmatively contradictory to Section 3574. Regulation has force of statute under Tidewater Marine. Mathews v. Eldridge balancing confirms due process violation. The 6.5-year temporal bar is an underground regulation under §11340.5 — never promulgated through APA notice-and-comment." }
  ],
  damages_table: [
    { category: "Lost Wages / Economic Harm", matters: "1-10, 13-15", conservative: 375000, moderate: 800000, aggressive: 1400000 },
    { category: "False Imprisonment", matters: "1, 2, 5, 10, 13, 14, 15", conservative: 90000, moderate: 225000, aggressive: 450000 },
    { category: "Emotional Distress", matters: "1-8, 14, 15", conservative: 110000, moderate: 300000, aggressive: 600000 },
    { category: "Bane Act / Treble", matters: "1, 2, 4, 8, 14", conservative: 120000, moderate: 325000, aggressive: 700000 },
    { category: "Punitive Damages", matters: "1-8, 14-18", conservative: 200000, moderate: 700000, aggressive: 1750000 },
    { category: "Consumer Fraud", matters: "12", conservative: 40000, moderate: 75000, aggressive: 150000 },
    { category: "Attorneys' Fees", matters: "1, 3, 6, 7, 8, 11, 13, 14, 17", conservative: 55000, moderate: 135000, aggressive: 350000 }
  ]
};

const StatusBadge = ({ status }) => {
  let color = "#6B7280";
  let bg = "rgba(107,114,128,0.15)";
  if (status.includes("Filed") || status.includes("Active")) { color = "#34D399"; bg = "rgba(52,211,153,0.12)"; }
  if (status.includes("Gov. Claim") || status.includes("45-day")) { color = GOLD; bg = "rgba(200,168,75,0.12)"; }
  if (status.includes("MTD") || status.includes("Hearing")) { color = "#F472B6"; bg = "rgba(244,114,182,0.12)"; }
  return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, color, background: bg, fontWeight: 600, whiteSpace: "nowrap", letterSpacing: 0.3 }}>{status.length > 40 ? status.slice(0, 38) + "…" : status}</span>;
};

const ClusterBadge = ({ cluster }) => {
  const labels = { 1: "CHP Stop", 2: "Parole/HOPE", 3: "Vehicle Fraud" };
  const colors = { 1: "#60A5FA", 2: "#A78BFA", 3: "#FBBF24" };
  return <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, color: colors[cluster], border: `1px solid ${colors[cluster]}40`, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{labels[cluster]}</span>;
};

const TypeBadge = ({ type }) => (
  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, color: type === "Federal" ? "#38BDF8" : "#FB923C", border: `1px solid ${type === "Federal" ? "#38BDF840" : "#FB923C40"}`, fontWeight: 600 }}>{type}</span>
);

const tabs = ["Dashboard", "Matters", "Timeline", "Damages", "Theories"];

export default function LitigationPortfolio() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [expandedMatter, setExpandedMatter] = useState(null);
  const [clusterFilter, setClusterFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [damagesView, setDamagesView] = useState("moderate");
  const [showPastEvents, setShowPastEvents] = useState(false);

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

  const [timeLeft, setTimeLeft] = useState({ label: "", days: 0, hours: 0, mins: 0, secs: 0, urgent: false });
  useEffect(() => {
    const tick = () => {
      const now = new Date();

      // Phase 1: counting down to default deadline
      if (now < DEFAULT_DEADLINE) {
        const diff = DEFAULT_DEADLINE - now;
        setTimeLeft({
          label: "Palacios Federal Default — Answer Deadline",
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          mins: Math.floor((diff % 3600000) / 60000),
          secs: Math.floor((diff % 60000) / 1000),
          urgent: diff < 86400000,
        });
        return;
      }

      // Phase 2: frozen at zeros between Mar 28 midnight PDT and Apr 1 midnight PDT
      if (now < CLOCK_FREEZE_UNTIL) {
        setTimeLeft({ label: "Palacios Federal Default — 03/28/2026", days: 0, hours: 0, mins: 0, secs: 0, urgent: false });
        return;
      }

      // Phase 3: Apr 1+ — count to the next upcoming event (5:00 PM PDT that day)
      if (upcomingEvents.length > 0) {
        const ev = upcomingEvents[0];
        const target = new Date(parseEventDatePDT(ev.date).getTime() + 17 * 3600 * 1000);
        const diff = target - now;
        if (diff <= 0) {
          setTimeLeft({ label: ev.date + " \u2014 " + ev.event.slice(0, 55), days: 0, hours: 0, mins: 0, secs: 0, urgent: true });
          return;
        }
        setTimeLeft({
          label: ev.date + " \u2014 " + ev.event.slice(0, 55),
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          mins: Math.floor((diff % 3600000) / 60000),
          secs: Math.floor((diff % 60000) / 1000),
          urgent: diff < 86400000,
        });
      } else {
        setTimeLeft({ label: "No upcoming deadlines", days: 0, hours: 0, mins: 0, secs: 0, urgent: false });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [upcomingEvents]);

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
        display: "flex", alignItems: "center", justifyContent: "center", gap: 28, flexWrap: "wrap"
      }}>
        <div style={{ color: GOLD, fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", whiteSpace: "nowrap" }}>
          ⚖ Deadline Clock
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[{ v: timeLeft.days, l: "Days" }, { v: timeLeft.hours, l: "Hrs" }, { v: timeLeft.mins, l: "Min" }, { v: timeLeft.secs, l: "Sec" }].map(({ v, l }, i) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {i > 0 && <span style={{ color: "#334155", fontSize: 18, lineHeight: 1, paddingBottom: 10 }}>:</span>}
              <div style={{ textAlign: "center", minWidth: 36 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: timeLeft.urgent ? "#EF4444" : "white", fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>
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
                  { n: 3, label: "Consumer Fraud / Defective Vehicle", color: "#FBBF24" }
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
              {[null, 1, 2, 3].map(c => (
                <button key={c ?? "all"} onClick={() => setClusterFilter(c)} style={{
                  padding: "8px 14px", borderRadius: 6, border: clusterFilter === c ? `1px solid ${GOLD}` : `1px solid ${NAVY}`,
                  background: clusterFilter === c ? `${GOLD}18` : CARD_BG, color: clusterFilter === c ? GOLD : "#94A3B8",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer"
                }}>{c === null ? "All" : c === 1 ? "CHP" : c === 2 ? "Parole/HOPE" : "Vehicle"}</button>
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
