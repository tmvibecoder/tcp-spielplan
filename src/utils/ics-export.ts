import type { Match, Team } from "../types";
import { CLUBS } from "../data/clubs";
import { PLIENING_ADDRESS, BTV_VEREIN_URL } from "../data/constants";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatICSDate(dateStr: string, timeStr: string): string {
  const [y, m, d] = dateStr.split("-");
  const [h, min] = timeStr.split(":");
  return `${y}${m}${d}T${h}${min}00`;
}

function addHours(dateStr: string, timeStr: string, hours: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  const date = new Date(y, m - 1, d, h + hours, min);
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

function escapeICS(str: string): string {
  return str.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
}

function uid(match: Match, team: Team): string {
  return `${match.date}-${match.time.replace(":", "")}-${team.id}@tcp-spielplan`;
}

export function generateICS(matches: Match[], team: Team): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}Z`;

  const events = matches.map((m) => {
    const opponent = m.isHome ? m.away : m.home;
    const summary = m.isHome
      ? `${team.emoji} ${team.shortLabel} vs. ${opponent}`
      : `${team.emoji} ${team.shortLabel} @ ${opponent}`;
    const location = m.isHome
      ? PLIENING_ADDRESS
      : CLUBS[opponent]?.address || "Adresse unbekannt";
    const description = [
      `Liga: ${team.league}`,
      m.isHome ? "Heimspiel" : "Auswärtsspiel",
      `Gegner: ${opponent}`,
      `Adresse: ${location}`,
      `Quelle: BTV Südbayern`,
      BTV_VEREIN_URL,
    ].join("\\n");

    return [
      "BEGIN:VEVENT",
      `UID:${uid(m, team)}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Europe/Berlin:${formatICSDate(m.date, m.time)}`,
      `DTEND;TZID=Europe/Berlin:${addHours(m.date, m.time, 4)}`,
      `SUMMARY:${escapeICS(summary)}`,
      `LOCATION:${escapeICS(location)}`,
      `DESCRIPTION:${escapeICS(description)}`,
      "END:VEVENT",
    ].join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TC Pliening//Spielplan Sommer 2026//DE",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:TCP ${team.label} Sommer 2026`,
    "X-WR-TIMEZONE:Europe/Berlin",
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Berlin",
    "BEGIN:DAYLIGHT",
    "DTSTART:19700329T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "END:STANDARD",
    "END:VTIMEZONE",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadICS(matches: Match[], team: Team): void {
  const content = generateICS(matches, team);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `TCP_${team.shortLabel}_Sommer2026.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
