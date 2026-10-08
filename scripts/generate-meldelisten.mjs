// Seit 08.10.2026 nur noch ein Aufrufer: Meldelisten UND Spielberichte entstehen
// gemeinsam in scripts/generate-data.mjs (JSON unter public/data). Der Name
// bleibt, damit `npm run gen:meldelisten`, crawl-meldelisten.mjs und die Doku
// weiter funktionieren.
//
//   npm run gen:meldelisten

console.log("gen:meldelisten → scripts/generate-data.mjs");
await import("./generate-data.mjs");
