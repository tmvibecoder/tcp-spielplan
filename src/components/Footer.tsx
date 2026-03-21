import { BTV_VEREIN_URL } from "../data/constants";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-700/50 pt-6 pb-8 text-center space-y-2">
      <p className="text-xs text-slate-500">
        Quelle: BTV Südbayern · Alle Angaben ohne Gewähr
      </p>
      <p className="text-xs text-slate-500">
        ⚠️ Beginnzeiten Sa/So können sich laut BTV noch auf 13:00 ändern (finale Zeiten ab 01.04.)
      </p>
      <a
        href={BTV_VEREIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-xs text-sky-400 hover:text-sky-300 transition-colors"
      >
        TC Pliening auf btv.de →
      </a>
    </footer>
  );
}
