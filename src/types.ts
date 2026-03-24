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

export type TeamFormat = "6er" | "4er";

export interface IndividualMatch {
  id: string;
  match_score_id: string;
  position: number;
  match_type: "singles" | "doubles";
  home_player: string;
  away_player: string;
  set1_home: number | null;
  set1_away: number | null;
  set2_home: number | null;
  set2_away: number | null;
  set3_home: number | null;
  set3_away: number | null;
  winner: "home" | "away" | null;
}

export interface MatchScore {
  id: string;
  team_id: string;
  match_date: string;
  match_time: string;
  home_wins: number;
  away_wins: number;
  individual_matches: IndividualMatch[];
}
