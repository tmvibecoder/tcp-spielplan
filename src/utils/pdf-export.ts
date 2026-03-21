import type { Match, Team } from "../types";
import { TEAMS } from "../data/teams";
import { MONTHS, MONTH_COLORS } from "../data/constants";
import { formatDate, getMonthKey } from "./date-helpers";

export function generatePrintHTML(matches: Match[], activeTeamIds: Set<string>): void {
  const teamMap = new Map(TEAMS.map((t) => [t.id, t]));
  const filtered = matches.filter((m) => activeTeamIds.has(m.teamId));

  // Group by month
  const byMonth = new Map<string, Match[]>();
  for (const m of filtered) {
    const mk = getMonthKey(m.date);
    if (!byMonth.has(mk)) byMonth.set(mk, []);
    byMonth.get(mk)!.push(m);
  }

  const sortedMonths = [...byMonth.keys()].sort();

  const matchRow = (m: Match, team: Team | undefined) => {
    const opponent = m.isHome ? m.away : m.home;
    const haTag = m.isHome
      ? '<span style="background:#14532d;color:#86efac;padding:1px 6px;border-radius:3px;font-size:11px;font-weight:600;">H</span>'
      : '<span style="background:#713f12;color:#fde68a;padding:1px 6px;border-radius:3px;font-size:11px;font-weight:600;">A</span>';
    const badge = team
      ? `<span style="display:inline-block;background:${team.color}20;color:${team.color};border:1px solid ${team.color}40;padding:1px 6px;border-radius:4px;font-size:11px;font-weight:600;margin-right:4px;">${team.emoji} ${team.shortLabel}</span>`
      : "";
    return `<tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:4px 8px;white-space:nowrap;font-size:12px;">${m.day} ${formatDate(m.date)}</td>
      <td style="padding:4px 8px;font-size:12px;">${m.time}</td>
      <td style="padding:4px 8px;">${badge}</td>
      <td style="padding:4px 8px;">${haTag}</td>
      <td style="padding:4px 8px;font-size:12px;">${opponent}</td>
    </tr>`;
  };

  let html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<title>TC Pliening Spielplan Sommer 2026</title>
<style>
  @page { size: A4 portrait; margin: 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Outfit', system-ui, sans-serif; color: #1e293b; font-size: 13px; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .subtitle { color: #64748b; font-size: 13px; margin-bottom: 16px; }
  .month-header { padding: 8px 12px; border-radius: 6px; margin: 16px 0 8px; font-weight: 800; font-size: 15px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  th { text-align: left; padding: 4px 8px; font-size: 11px; color: #64748b; border-bottom: 2px solid #e2e8f0; }
  .footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; }
</style></head><body>
<h1>🎾 TC Pliening e.V. — Spielplan Sommer 2026</h1>
<p class="subtitle">${filtered.length} Spiele · ${filtered.filter(m=>m.isHome).length} Heim · ${filtered.filter(m=>!m.isHome).length} Auswärts</p>`;

  for (const mk of sortedMonths) {
    const monthMatches = byMonth.get(mk)!.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    const colors = MONTH_COLORS[mk];
    const monthName = MONTHS[mk] || mk;

    html += `<div class="month-header" style="background:${colors?.accent || "#64748b"}20;color:${colors?.accent || "#1e293b"};border-left:4px solid ${colors?.accent || "#64748b"};">
      ${monthName} 2026 · ${monthMatches.length} Spiele
    </div>`;
    html += `<table><thead><tr><th>Datum</th><th>Zeit</th><th>Team</th><th>H/A</th><th>Gegner</th></tr></thead><tbody>`;
    for (const m of monthMatches) {
      html += matchRow(m, teamMap.get(m.teamId));
    }
    html += `</tbody></table>`;
  }

  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`;
  html += `<div class="footer">Erstellt am ${dateStr} · BTV Südbayern · Alle Angaben ohne Gewähr · Beginnzeiten können sich noch ändern</div>`;
  html += `</body></html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
}
