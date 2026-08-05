import type { MonthColor } from "../types";

export const PLIENING_ADDRESS = "TC Pliening, Mitterweg 13, 85652 Pliening";
export const BTV_VEREIN_URL = "https://www.btv.de/de/mein-verein/vereinsseite/tc-pliening.html#Mannschaften";

export const CATEGORIES = [
  { label: "Herren", ids: ["herren","herren30","herren40","herren40ii","herren40iii","herren50","herren50ii","herren50iii","herren60"] },
  { label: "Damen", ids: ["damen","damen40","damen50","damen50ii"] },
  { label: "Mixed", ids: ["mixed"] },
  { label: "Jugend", ids: ["juniorinnen18","knaben15","knaben15ii","midcourt"] },
];

export const MONTHS: Record<string, string> = {
  "2026-05": "Mai",
  "2026-06": "Juni",
  "2026-07": "Juli",
  "2026-08": "August",
  "2026-09": "September",
};

export const MONTH_COLORS: Record<string, MonthColor> = {
  "2026-05": {
    bg: "#0c4a6e25", border: "#0369a140", accent: "#38bdf8", headerBg: "#0c4a6e50", label: "#7dd3fc",
    weekBgs: ["#0c4a6e15", "#0c4a6e30", "#0c4a6e15", "#0c4a6e30", "#0c4a6e15", "#0c4a6e30"],
  },
  "2026-06": {
    bg: "#14532d25", border: "#16a34a40", accent: "#4ade80", headerBg: "#14532d50", label: "#86efac",
    weekBgs: ["#14532d15", "#14532d30", "#14532d15", "#14532d30", "#14532d15", "#14532d30"],
  },
  "2026-07": {
    bg: "#7c2d1225", border: "#dc262640", accent: "#f87171", headerBg: "#7c2d1250", label: "#fca5a5",
    weekBgs: ["#7c2d1215", "#7c2d1230", "#7c2d1215", "#7c2d1230", "#7c2d1215", "#7c2d1230"],
  },
  // August/September: Mixed-Runde (Gr. 074) — läuft nach dem Ende der Sommerrunde.
  "2026-08": {
    bg: "#4c1d9525", border: "#7c3aed40", accent: "#a78bfa", headerBg: "#4c1d9550", label: "#c4b5fd",
    weekBgs: ["#4c1d9515", "#4c1d9530", "#4c1d9515", "#4c1d9530", "#4c1d9515", "#4c1d9530"],
  },
  "2026-09": {
    bg: "#134e4a25", border: "#0d948840", accent: "#2dd4bf", headerBg: "#134e4a50", label: "#5eead4",
    weekBgs: ["#134e4a15", "#134e4a30", "#134e4a15", "#134e4a30", "#134e4a15", "#134e4a30"],
  },
};
