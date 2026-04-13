// Returns midnight for a given date expressed in Pacific time (PDT/PST aware).
export const getPDTMidnight = (date = new Date()) => {
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
// Strips a leading "~" (approximate date marker) before parsing.
export const parseEventDatePDT = (dateStr) => {
  const temp = new Date(dateStr.replace(/^~/, "").replace(/\./g, ""));
  // Use same offset logic: all portfolio dates are in PDT (Mar–Oct 2026 = UTC-7)
  return new Date(Date.UTC(temp.getFullYear(), temp.getMonth(), temp.getDate(), 7, 0, 0));
};
