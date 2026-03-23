import { BTV_VEREIN_URL } from "../data/constants";

interface FooterProps {
  onNavigate?: (page: "impressum" | "datenschutz") => void;
}

export default function Footer({ onNavigate }: FooterProps) {
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
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={() => onNavigate?.("impressum")}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Impressum
        </button>
        <span className="text-xs text-slate-600">·</span>
        <button
          onClick={() => onNavigate?.("datenschutz")}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Datenschutz
        </button>
      </div>
    </footer>
  );
}
