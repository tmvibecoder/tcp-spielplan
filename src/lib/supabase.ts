import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Live-Zwischenstände (Supabase) sind seit 09.10.2026 standardmäßig AUS:
// Thomas nutzt die Funktion nicht, und ohne sie baut die Seite keine Verbindung
// zu einem Drittanbieter mehr auf (Datenschutz). Einschalten über
// VITE_LIVE_SCORES=on in der .env — dann erst wird der Client erzeugt und die
// Ergebnis-Eingabe in der Begegnung angezeigt.
export const LIVE_SCORES_ENABLED = import.meta.env.VITE_LIVE_SCORES === "on";

let client: SupabaseClient | null = null;

/** Supabase-Client, erst beim ersten Zugriff erzeugt (nur bei eingeschalteten Live-Scores). */
export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL as string;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    client = createClient(url, key);
  }
  return client;
}
