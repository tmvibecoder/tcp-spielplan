export interface Team {
  id: string;
  label: string;
  shortLabel: string;
  league: string;
  color: string;
  emoji: string;
}

export interface Match {
  teamId: string;
  date: string;
  time: string;
  day: string;
  home: string;
  away: string;
  isHome: boolean;
}

export interface Club {
  address: string;
}

export interface MonthColor {
  bg: string;
  border: string;
  accent: string;
  headerBg: string;
  label: string;
  weekBgs: string[];
}
