// Seit 08.10.2026 nur noch ein Aufrufer: Spielberichte UND Meldelisten entstehen
// gemeinsam in scripts/generate-data.mjs (JSON unter public/data). Der Name
// bleibt, damit `npm run gen:spielberichte`, der Wecker (briefing-run.mjs) und
// die Doku weiter funktionieren.
//
//   npm run gen:spielberichte

console.log("gen:spielberichte → scripts/generate-data.mjs");
await import("./generate-data.mjs");
