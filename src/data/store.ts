import { useEffect, useState } from "react";
import type { SeasonId } from "../types";
import { clubPath, groupPath, SEARCH_PATH, type ClubData, type GroupData, type SearchIndex } from "./data-format";
import { decodeClub, decodeGroup, decodeSearch, type ClubFile, type GroupFile, type SearchFile } from "./data-codec";
import { DATA_VERSION } from "./data-version";
import { baseClub } from "./player-key";

// ── Nachladen der JSON-Daten (public/data) ───────────────────────────────────
//
// Jede Datei wird höchstens einmal geholt; laufende Anfragen werden geteilt.
// `?v=<Datenstand>` sorgt dafür, dass der Browser nach jedem Generatorlauf die
// neue Datei zieht, obwohl die Pfade gleich bleiben (public/-Dateien tragen
// keinen Hash im Namen). Fehlt eine Datei (404), gilt sie als leer — ein Verein
// ohne Einsätze oder eine Gruppe ohne Berichte ist kein Fehler.

const cache = new Map<string, Promise<unknown>>();
const loaded = new Map<string, unknown>();

function fetchJson<F, T>(path: string, decode: (f: F) => T, empty: T): Promise<T> {
  let p = cache.get(path) as Promise<T> | undefined;
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}${path}?v=${DATA_VERSION}`)
      .then(async (r) => {
        if (r.status === 404) return empty;
        if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
        return decode((await r.json()) as F);
      })
      .then((v) => { loaded.set(path, v); return v; });
    cache.set(path, p);
  }
  return p;
}

export function loadGroup(season: SeasonId, league: string): Promise<GroupData> {
  return fetchJson<GroupFile, GroupData>(groupPath(season, league), decodeGroup, { season, league, teamLabel: "", reports: [], rosters: [] });
}

export function loadClub(club: string): Promise<ClubData> {
  const base = baseClub(club);
  return fetchJson<ClubFile, ClubData>(clubPath(base), decodeClub, { club: base, players: [] });
}

export function loadSearchIndex(): Promise<SearchIndex> {
  return fetchJson<SearchFile, SearchIndex>(SEARCH_PATH, decodeSearch, { players: [], teams: [] });
}

/** Schon geladene Datei synchron (für Erst-Render ohne Flackern). */
function peek<T>(path: string): T | undefined {
  return loaded.get(path) as T | undefined;
}

// ── React-Hooks ──────────────────────────────────────────────────────────────

export interface Loaded<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
}

function useLoaded<T>(path: string | null, load: (() => Promise<T>) | null): Loaded<T> {
  const [state, setState] = useState<Loaded<T>>(() => {
    const hit = path ? peek<T>(path) : undefined;
    return { data: hit, loading: !!path && !hit, error: null };
  });
  useEffect(() => {
    if (!path || !load) { setState({ data: undefined, loading: false, error: null }); return; }
    const hit = peek<T>(path);
    if (hit) { setState({ data: hit, loading: false, error: null }); return; }
    let alive = true;
    setState({ data: undefined, loading: true, error: null });
    load().then(
      (data) => { if (alive) setState({ data, loading: false, error: null }); },
      (e) => { if (alive) setState({ data: undefined, loading: false, error: String(e?.message ?? e) }); },
    );
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
  return state;
}

/** Alle Berichte und Meldelisten einer Gruppe. `league` null = nichts laden. */
export function useGroup(season: SeasonId, league: string | null): Loaded<GroupData> {
  const path = league ? groupPath(season, league) : null;
  return useLoaded<GroupData>(path, league ? () => loadGroup(season, league) : null);
}

/** Alle Personen eines Vereins mit ihren Einsätzen (alle Saisons). */
export function useClub(club: string | null): Loaded<ClubData> {
  const path = club ? clubPath(baseClub(club)) : null;
  return useLoaded<ClubData>(path, club ? () => loadClub(club) : null);
}

export function useSearchIndex(): Loaded<SearchIndex> {
  return useLoaded<SearchIndex>(SEARCH_PATH, loadSearchIndex);
}
