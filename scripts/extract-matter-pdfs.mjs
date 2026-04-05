/**
 * extract-matter-pdfs.mjs
 *
 * Extracts key details from Matter 1's PDFs using the Claude API — one API call
 * per PDF — so zero tokens spill into the Claude Code session context.
 *
 * Usage:
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *   node scripts/extract-matter-pdfs.mjs            # dry-run: prints patch JSON
 *   node scripts/extract-matter-pdfs.mjs --write    # patches src/data/matters.js
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(REPO_ROOT, "public", "documents", "matter-01");
const MATTERS_JS = path.join(REPO_ROOT, "src", "data", "matters.js");

// ---------------------------------------------------------------------------
// PDF catalogue — tier determines model and extraction depth
// ---------------------------------------------------------------------------
const PDFS = [
  // SUBSTANTIVE — full extraction with Sonnet
  {
    file: "0.Newanforbi v. CHP.pdf",
    tier: "substantive",
    label: "Original Complaint",
  },
  {
    file: "CHP Motion To Dismiss.pdf",
    tier: "substantive",
    label: "CHP Motion to Dismiss",
  },
  {
    file: "Opposition for Motion to Dismiss.pdf",
    tier: "substantive",
    label: "Plaintiff's Opposition to MTD",
  },
  { file: "Reply - CHP.pdf", tier: "substantive", label: "CHP Reply" },

  // PROCEDURAL — lighter extraction with Haiku
  {
    file: "02_Initial_Scheduling_Order.pdf",
    tier: "procedural",
    label: "Initial Scheduling Order",
  },
  {
    file: "03_Magistrate_Judge_Consent.pdf",
    tier: "procedural",
    label: "Magistrate Judge Consent",
  },
  { file: "07_Summons_Sheet.pdf", tier: "procedural", label: "Summons" },
  {
    file: "08_Return_of_Service.pdf",
    tier: "procedural",
    label: "Return of Service",
  },

  // SKIP (administrative) — not processed:
  // 01_Lawsuit_Cover_Sheet.pdf
  // 04_Magistrate_Judge_Availabilty.pdf
  // 05_Magistrate_Judge_Consent_Decline_Sheet.pdf
  // 06_Notice_of_E-Filing_1.pdf
  // 09_Notice_of_E-Filing_2.pdf
  // 10_Filing_Fee_Receipt.pdf
];

// ---------------------------------------------------------------------------
// Model selection
// ---------------------------------------------------------------------------
const MODEL_SUBSTANTIVE = "claude-sonnet-4-6";
const MODEL_PROCEDURAL = "claude-haiku-4-5-20251001";
const MODEL_SYNTHESIS = "claude-sonnet-4-6";

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------
const EXTRACTION_PROMPT_SUBSTANTIVE = `You are a legal analyst reviewing a court document.
Extract ALL meaningful information and return ONLY valid JSON (no markdown fences, no prose):

{
  "doc_type": "complaint|motion_to_dismiss|opposition|reply|order|summons|return_of_service|other",
  "key_facts": ["concise bullet strings — include specific dates, names, badge #s, locations, quotes"],
  "dates": [{"event": "description", "date": "YYYY-MM-DD or month/year"}],
  "parties": ["Party Name — Role"],
  "claims_or_arguments": ["each claim or argument as a string"],
  "evidence_cited": ["each piece of evidence named in the document"],
  "defense_arguments": ["if this is a defense filing, list their arguments"],
  "court_orders_or_rulings": ["any orders, rulings, or relief granted"],
  "procedural_significance": "1-2 sentence summary of this document's role in the case"
}`;

const EXTRACTION_PROMPT_PROCEDURAL = `You are a legal analyst reviewing a procedural court document.
Extract key details and return ONLY valid JSON (no markdown fences, no prose):

{
  "doc_type": "scheduling_order|consent_form|summons|return_of_service|notice|receipt|other",
  "dates": [{"event": "description", "date": "YYYY-MM-DD or month/year"}],
  "parties": ["Party Name — Role"],
  "procedural_significance": "1-2 sentence summary of this document's procedural role"
}`;

const SYNTHESIS_PROMPT = (extracts) => `You are updating a litigation portfolio dashboard for:
Matter 1 — Newanforbi v. CHP et al., Case No. 2:25-cv-01460-DC-CSK (USDC E.D. Cal.)
Claims: 42 U.S.C. § 1983 — Fourth Amendment Search/Seizure, Due Process, Monell

Here are the per-document extractions (JSON) from all processed PDFs:

${JSON.stringify(extracts, null, 2)}

Using ONLY information present in the extractions above, produce a JSON object (no markdown, no prose)
that updates these fields for the matter:

{
  "key_facts": "Rich, detailed narrative paragraph (400–700 words). Include: the Nov. 1 2024 incident on I-580, Tesla rental, cup of [REDACTED] vs. alcohol allegation, PAS refusal, fabricated DUI report (slurred speech/alcohol odor), no charges filed, 5-day parole hold, officer names and badge numbers, and any relevant legal standards cited in the complaint. Weave in case theory.",
  "procedural_status": "Detailed chronological narrative. Include filing date, docket events with dates, service of process, MTD filing, opposition, reply, and current status.",
  "evidence": ["Array of specific evidence items extracted from the documents — dashcam, DUI report, declarations, etc."],
  "damages": "Dollar range string e.g. '$150,000 – $400,000+' — use complaint's prayer for relief if present",
  "risk": "Paragraph covering: (a) defendants' strongest arguments from the MTD, (b) plaintiff's counter-arguments from the opposition, (c) overall assessment of qualified immunity exposure"
}`;

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

function readPDFAsBase64(filePath) {
  const buf = fs.readFileSync(filePath);
  return buf.toString("base64");
}

async function extractFromPDF(client, filePath, label, tier) {
  const base64 = readPDFAsBase64(filePath);
  const model = tier === "substantive" ? MODEL_SUBSTANTIVE : MODEL_PROCEDURAL;
  const prompt =
    tier === "substantive"
      ? EXTRACTION_PROMPT_SUBSTANTIVE
      : EXTRACTION_PROMPT_PROCEDURAL;

  console.error(`  [${tier.toUpperCase()}] ${label} (${model})...`);

  const response = await client.messages.create({
    model,
    max_tokens: tier === "substantive" ? 2048 : 512,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64,
            },
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
    betas: ["pdfs-2024-09-25"],
  });

  const raw = response.content[0].text.trim();

  // Strip markdown code fences if model wrapped the JSON anyway
  const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  try {
    return { label, tier, data: JSON.parse(jsonStr) };
  } catch {
    console.error(
      `  WARNING: could not parse JSON for "${label}", storing raw text`
    );
    return { label, tier, data: { raw } };
  }
}

async function synthesizeMatter(client, extracts) {
  console.error(`  [SYNTHESIS] Merging ${extracts.length} extractions...`);

  const response = await client.messages.create({
    model: MODEL_SYNTHESIS,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: SYNTHESIS_PROMPT(extracts),
      },
    ],
  });

  const raw = response.content[0].text.trim();
  const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  try {
    return JSON.parse(jsonStr);
  } catch {
    throw new Error(
      `Synthesis produced non-JSON output:\n${raw.slice(0, 500)}`
    );
  }
}

// ---------------------------------------------------------------------------
// Patch matters.js — replaces the Matter 1 object fields in-place
// ---------------------------------------------------------------------------
function patchMattersJs(patch) {
  const src = fs.readFileSync(MATTERS_JS, "utf8");

  // Escape a string value for embedding in a JS source file
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`");

  // Build the replacement for each field
  const fields = [
    {
      key: "key_facts",
      regex: /(key_facts:\s*")[^"]*(")/,
      replacement: `key_facts: "${esc(patch.key_facts)}"`,
    },
    {
      key: "procedural_status",
      regex: /(procedural_status:\s*")[^"]*(")/,
      replacement: `procedural_status: "${esc(patch.procedural_status)}"`,
    },
    {
      key: "damages",
      regex: /(damages:\s*")[^"]*(")/,
      replacement: `damages: "${esc(patch.damages)}"`,
    },
    {
      key: "risk",
      regex: /(risk:\s*")[^"]*(")/,
      replacement: `risk: "${esc(patch.risk)}"`,
    },
  ];

  // Only replace within the Matter 1 block (number: 1) — find its boundaries
  // Matter 1 is the first object in the cases array; it ends before number: 2
  const matter1Start = src.indexOf("number: 1,");
  const matter2Start = src.indexOf("number: 2,");

  if (matter1Start === -1 || matter2Start === -1) {
    throw new Error(
      "Could not locate Matter 1 or Matter 2 boundaries in matters.js"
    );
  }

  let before = src.slice(0, matter1Start);
  let matter1Block = src.slice(matter1Start, matter2Start);
  let after = src.slice(matter2Start);

  // Apply field replacements inside Matter 1 block
  for (const { key, regex, replacement } of fields) {
    if (regex.test(matter1Block)) {
      matter1Block = matter1Block.replace(regex, replacement);
    } else {
      console.error(
        `  WARNING: could not find field "${key}" in Matter 1 block — skipping`
      );
    }
  }

  // Replace evidence array
  if (patch.evidence && Array.isArray(patch.evidence)) {
    const evidenceItems = patch.evidence
      .map((e) => `        "${esc(e)}"`)
      .join(",\n");
    const evidenceReplacement = `evidence: [\n${evidenceItems}\n      ]`;
    matter1Block = matter1Block.replace(
      /evidence:\s*\[[^\]]*\]/s,
      evidenceReplacement
    );
  }

  fs.writeFileSync(MATTERS_JS, before + matter1Block + after, "utf8");
  console.error("  matters.js patched successfully.");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const writeMode = process.argv.includes("--write");

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ERROR: ANTHROPIC_API_KEY environment variable not set.");
    process.exit(1);
  }

  const client = new Anthropic();

  console.error(
    `\n=== Matter 1 PDF Extraction ===\nMode: ${writeMode ? "WRITE (will update matters.js)" : "DRY-RUN (stdout only)"}\nDocs dir: ${DOCS_DIR}\n`
  );

  // Step 1: Extract each PDF
  const extracts = [];
  for (const { file, tier, label } of PDFS) {
    const filePath = path.join(DOCS_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.error(`  SKIP (not found): ${file}`);
      continue;
    }
    const result = await extractFromPDF(client, filePath, label, tier);
    extracts.push(result);
  }

  if (extracts.length === 0) {
    console.error("No PDFs were successfully processed. Exiting.");
    process.exit(1);
  }

  // Step 2: Synthesis
  const patch = await synthesizeMatter(client, extracts);

  // Step 3: Output or write
  if (writeMode) {
    patchMattersJs(patch);
    console.error("\nDone. Run `npm run dev` to verify the updated Matter 1 card.");
  } else {
    console.log(JSON.stringify(patch, null, 2));
    console.error(
      "\nDry-run complete. Re-run with --write to apply patch to src/data/matters.js"
    );
  }
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
