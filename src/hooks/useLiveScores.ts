import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { MatchScore, IndividualMatch } from "../types";

type ScoresMap = Map<string, MatchScore>;

function makeKey(teamId: string, date: string, time: string): string {
  return `${teamId}-${date}-${time}`;
}

export function useLiveScores() {
  const [scores, setScores] = useState<ScoresMap>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial fetch
  useEffect(() => {
    async function load() {
      try {
        const { data: matchScores, error: msError } = await supabase
          .from("match_scores")
          .select("*");

        if (msError) throw msError;
        if (!matchScores || matchScores.length === 0) {
          setLoading(false);
          return;
        }

        const { data: individuals, error: imError } = await supabase
          .from("individual_matches")
          .select("*");

        if (imError) throw imError;

        const map: ScoresMap = new Map();
        for (const ms of matchScores) {
          const key = makeKey(ms.team_id, ms.match_date, ms.match_time);
          const ims = (individuals || []).filter(
            (im: IndividualMatch) => im.match_score_id === ms.id
          );
          map.set(key, {
            ...ms,
            individual_matches: ims,
          });
        }
        setScores(map);
      } catch (e) {
        console.error("Failed to load scores:", e);
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("live-scores")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "match_scores" },
        async (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const ms = payload.new as MatchScore;
            const key = makeKey(ms.team_id, ms.match_date, ms.match_time);

            // Fetch individual matches for this score
            const { data: ims } = await supabase
              .from("individual_matches")
              .select("*")
              .eq("match_score_id", ms.id);

            setScores((prev) => {
              const next = new Map(prev);
              next.set(key, { ...ms, individual_matches: ims || [] });
              return next;
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "individual_matches" },
        async (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const im = payload.new as IndividualMatch;
            // Find which match_score this belongs to and refresh it
            const { data: ms } = await supabase
              .from("match_scores")
              .select("*")
              .eq("id", im.match_score_id)
              .single();

            if (ms) {
              const key = makeKey(ms.team_id, ms.match_date, ms.match_time);
              const { data: ims } = await supabase
                .from("individual_matches")
                .select("*")
                .eq("match_score_id", ms.id);

              setScores((prev) => {
                const next = new Map(prev);
                next.set(key, { ...ms, individual_matches: ims || [] });
                return next;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Upsert match score + individual matches
  const saveScores = useCallback(
    async (
      teamId: string,
      matchDate: string,
      matchTime: string,
      individualMatches: Omit<IndividualMatch, "id" | "match_score_id">[]
    ) => {
      try {
        // Compute team score
        let homeWins = 0;
        let awayWins = 0;
        for (const im of individualMatches) {
          if (im.winner === "home") homeWins++;
          else if (im.winner === "away") awayWins++;
        }

        // Upsert match_scores
        const { data: ms, error: msError } = await supabase
          .from("match_scores")
          .upsert(
            {
              team_id: teamId,
              match_date: matchDate,
              match_time: matchTime,
              home_wins: homeWins,
              away_wins: awayWins,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "team_id,match_date,match_time" }
          )
          .select()
          .single();

        if (msError) throw msError;

        // Upsert individual matches
        for (const im of individualMatches) {
          const { error: imError } = await supabase
            .from("individual_matches")
            .upsert(
              {
                match_score_id: ms.id,
                position: im.position,
                match_type: im.match_type,
                home_player: im.home_player,
                away_player: im.away_player,
                set1_home: im.set1_home,
                set1_away: im.set1_away,
                set2_home: im.set2_home,
                set2_away: im.set2_away,
                set3_home: im.set3_home,
                set3_away: im.set3_away,
                winner: im.winner,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "match_score_id,position" }
            );

          if (imError) throw imError;
        }

        return { success: true };
      } catch (e) {
        console.error("Failed to save scores:", e);
        return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
      }
    },
    []
  );

  return { scores, loading, error, saveScores };
}
