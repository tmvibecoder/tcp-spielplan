import type { Match, Team } from "../types";
import { TEAMS } from "../data/teams";
import { MONTHS, MONTH_COLORS } from "../data/constants";
import { formatDate, getMonthKey, getWeekKey, weekendLabel } from "./date-helpers";

interface DayGroup {
  date: string;
  day: string;
  matches: Match[];
}

interface WeekGroup {
  weekKey: string;
  dates: string[];
  days: DayGroup[];
  matchCount: number;
}

export function generatePrintHTML(matches: Match[], activeTeamIds: Set<string>): void {
  const teamMap = new Map(TEAMS.map((t) => [t.id, t]));
  const filtered = matches.filter((m) => activeTeamIds.has(m.teamId));

  // Group: month → week → day → matches
  const byMonth = new Map<string, Map<string, Map<string, Match[]>>>();
  for (const m of filtered) {
    const mk = getMonthKey(m.date);
    const wk = getWeekKey(m.date);
    if (!byMonth.has(mk)) byMonth.set(mk, new Map());
    const monthMap = byMonth.get(mk)!;
    if (!monthMap.has(wk)) monthMap.set(wk, new Map());
    const weekMap = monthMap.get(wk)!;
    if (!weekMap.has(m.date)) weekMap.set(m.date, []);
    weekMap.get(m.date)!.push(m);
  }

  const sortedMonths = [...byMonth.keys()].sort();

  // Build structured data
  const monthData = sortedMonths.map((mk) => {
    const weekMap = byMonth.get(mk)!;
    const weeks: WeekGroup[] = [...weekMap.keys()].sort().map((wk) => {
      const dayMap = weekMap.get(wk)!;
      const days: DayGroup[] = [...dayMap.keys()].sort().map((date) => {
        const dayMatches = dayMap.get(date)!.sort((a, b) => a.time.localeCompare(b.time));
        return { date, day: dayMatches[0].day, matches: dayMatches };
      });
      return {
        weekKey: wk,
        dates: days.map((d) => d.date),
        days,
        matchCount: days.reduce((s, d) => s + d.matches.length, 0),
      };
    });
    return { mk, weeks, matchCount: weeks.reduce((s, w) => s + w.matchCount, 0) };
  });

  // PDF month colors (print-friendly, lighter)
  const printColors: Record<string, { bg: string; border: string; accent: string; headerBg: string; dayFr: string; daySa: string; daySo: string }> = {
    "2026-05": { bg: "#e0f2fe", border: "#0284c7", accent: "#0369a1", headerBg: "#bae6fd", dayFr: "#f0f9ff", daySa: "#e0f2fe", daySo: "#bae6fd" },
    "2026-06": { bg: "#dcfce7", border: "#16a34a", accent: "#15803d", headerBg: "#bbf7d0", dayFr: "#f0fdf4", daySa: "#dcfce7", daySo: "#bbf7d0" },
    "2026-07": { bg: "#fee2e2", border: "#dc2626", accent: "#b91c1c", headerBg: "#fecaca", dayFr: "#fef2f2", daySa: "#fee2e2", daySo: "#fecaca" },
  };

  const dayFullName: Record<string, string> = { Fr: "Freitag", Sa: "Samstag", So: "Sonntag", Mo: "Montag", Di: "Dienstag", Mi: "Mittwoch", Do: "Donnerstag" };

  const badge = (team: Team) =>
    `<span style="display:inline-flex;align-items:center;gap:3px;background:${team.color}18;color:${team.color};border:1.5px solid ${team.color}60;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap;">
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${team.color};"></span>
      ${team.shortLabel}
    </span>`;

  const haTag = (isHome: boolean) => isHome
    ? '<span style="background:#15803d;color:#fff;padding:1px 7px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:0.5px;">H</span>'
    : '<span style="background:#a16207;color:#fff;padding:1px 7px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:0.5px;">A</span>';

  let html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<title>TC Pliening Spielplan Sommer 2026</title>
<style>
  @page { size: A4 portrait; margin: 12mm 14mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Outfit', system-ui, -apple-system, sans-serif; color: #1e293b; font-size: 12px; line-height: 1.4; }
  .header { text-align: center; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
  .header h1 { font-size: 22px; font-weight: 800; margin-bottom: 2px; }
  .header .sub { color: #64748b; font-size: 12px; }
  .month { margin-bottom: 18px; break-inside: avoid-column; }
  .month-header { padding: 7px 14px; border-radius: 6px; font-weight: 800; font-size: 14px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .month-header .count { font-size: 11px; font-weight: 600; opacity: 0.7; }
  .weekend { border: 1.5px solid #e2e8f0; border-radius: 6px; margin-bottom: 8px; overflow: hidden; break-inside: avoid; }
  .weekend-header { padding: 5px 12px; font-size: 11px; font-weight: 700; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
  .weekend-header .pill { font-size: 10px; font-weight: 700; padding: 1px 8px; border-radius: 10px; color: #fff; }
  .day-section { border-bottom: 1px solid #f1f5f9; }
  .day-section:last-child { border-bottom: none; }
  .day-label { padding: 4px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid #e2e8f020; }
  .match-row { display: flex; align-items: center; padding: 3px 12px; gap: 8px; border-bottom: 1px solid #f8fafc; }
  .match-row:last-child { border-bottom: none; }
  .match-row .time { font-size: 11px; font-weight: 600; color: #475569; width: 38px; flex-shrink: 0; font-variant-numeric: tabular-nums; }
  .match-row .team-badge { flex-shrink: 0; }
  .match-row .ha { flex-shrink: 0; }
  .match-row .opponent { font-size: 11px; color: #334155; flex: 1; }
  .footer { margin-top: 16px; padding-top: 8px; border-top: 1.5px solid #e2e8f0; font-size: 9px; color: #94a3b8; text-align: center; }
</style></head><body>

<div class="header">
  <h1>🎾 TC Pliening e.V.</h1>
  <div class="sub">Spielplan Sommer 2026 · ${filtered.length} Spiele · ${filtered.filter(m => m.isHome).length} Heim · ${filtered.filter(m => !m.isHome).length} Auswärts</div>
</div>`;

  for (const month of monthData) {
    const colors = printColors[month.mk] || printColors["2026-05"];
    const monthName = MONTHS[month.mk] || month.mk;

    html += `<div class="month">`;
    html += `<div class="month-header" style="background:${colors.headerBg};color:${colors.accent};border-left:4px solid ${colors.border};">
      <span>${monthName} 2026</span>
      <span class="count">${month.matchCount} Spiele</span>
    </div>`;

    for (const week of month.weeks) {
      html += `<div class="weekend" style="border-color:${colors.border}40;">`;
      html += `<div class="weekend-header" style="background:${colors.bg};">
        <span style="color:${colors.accent};">📅 ${weekendLabel(week.dates)}</span>
        <span class="pill" style="background:${colors.border};">${week.matchCount}</span>
      </div>`;

      for (const dayData of week.days) {
        const dayBg = dayData.day === "Fr" ? colors.dayFr
          : dayData.day === "Sa" ? colors.daySa
          : colors.daySo;

        html += `<div class="day-section">`;
        html += `<div class="day-label" style="background:${dayBg};color:${colors.accent};">
          ${dayFullName[dayData.day] || dayData.day}, ${formatDate(dayData.date)}
          ${dayData.matches.length >= 2 ? `<span style="margin-left:6px;background:${colors.border}20;color:${colors.accent};padding:0 5px;border-radius:8px;font-size:9px;">${dayData.matches.length} Spiele</span>` : ""}
        </div>`;

        for (const m of dayData.matches) {
          const team = teamMap.get(m.teamId);
          const opponent = m.isHome ? m.away : m.home;
          html += `<div class="match-row" style="background:${dayBg}80;">
            <span class="time">${m.time}</span>
            <span class="team-badge">${team ? badge(team) : ""}</span>
            <span class="ha">${haTag(m.isHome)}</span>
            <span class="opponent">${opponent}</span>
          </div>`;
        }

        html += `</div>`;
      }

      html += `</div>`;
    }

    html += `</div>`;
  }

  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`;
  html += `<div class="footer">
    Erstellt am ${dateStr} · BTV Südbayern · Alle Angaben ohne Gewähr · Beginnzeiten können sich noch ändern
  </div>`;
  html += `</body></html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
}
