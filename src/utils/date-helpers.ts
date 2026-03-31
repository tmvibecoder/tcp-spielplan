/**
 * Get day number from a YYYY-MM-DD date string.
 */
export function getDayFromDate(dateStr: string): number {
  return parseInt(dateStr.split("-")[2], 10);
}

/**
 * Format "2026-05-02" → "02.05."
 */
export function formatDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${d}.${m}.`;
}

/**
 * Format "2026-05-02" → "Samstag, 02.05.2026"
 */
export function formatDateFull(dateStr: string, day: string): string {
  const dayNames: Record<string, string> = {
    Mo: "Montag",
    Di: "Dienstag",
    Mi: "Mittwoch",
    Do: "Donnerstag",
    Fr: "Freitag",
    Sa: "Samstag",
    So: "Sonntag",
  };
  const [y, m, d] = dateStr.split("-");
  return `${dayNames[day] || day}, ${d}.${m}.${y}`;
}

/**
 * Get ISO-8601 week key like "2026-W18" from a date string.
 */
export function getWeekKey(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const thursday = new Date(date);
  thursday.setDate(date.getDate() + (3 - ((date.getDay() + 6) % 7)));
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const weekNum = Math.ceil(
    ((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${thursday.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

/**
 * Get a weekend label like "Fr 01.05. – So 03.05." from the matches in a weekend block.
 */
export function weekendLabel(dates: string[]): string {
  if (dates.length === 0) return "";
  const sorted = [...dates].sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const dayName = (ds: string) => {
    const d = new Date(ds + "T12:00:00");
    return ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d.getDay()];
  };

  if (first === last) {
    return `${dayName(first)} ${formatDate(first)}`;
  }
  return `${dayName(first)} ${formatDate(first)} – ${dayName(last)} ${formatDate(last)}`;
}

/**
 * Get month key like "2026-05" from date string.
 */
export function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7);
}

/**
 * Format day header like "SA 2. MAI" or "SO 10. MAI" from date + day abbreviation.
 */
export function formatDayHeader(dateStr: string, day: string): string {
  const monthNames: Record<string, string> = {
    "01": "JAN", "02": "FEB", "03": "MÄR", "04": "APR",
    "05": "MAI", "06": "JUN", "07": "JUL", "08": "AUG",
    "09": "SEP", "10": "OKT", "11": "NOV", "12": "DEZ",
  };
  const dayNum = parseInt(dateStr.split("-")[2], 10);
  const month = dateStr.split("-")[1];
  return `${day.toUpperCase()} ${dayNum}. ${monthNames[month] || month}`;
}
