import React, { useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { ImageItem, getRpgLevel, getRankTier } from '../utils/elo';

interface ImageModalProps {
  item: ImageItem | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ item, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const tier = getRankTier(item.elo);
  const lvl = getRpgLevel(item.elo);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Dettagli ${item.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="rpg-window w-full max-w-4xl max-h-[90vh] flex flex-col p-4 text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-blue-900/60 mb-3">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-xs text-amber-300">ISPEZIONE DETTAGLIATA</span>
            <span className="text-slate-400 font-mono text-sm truncate max-w-md">{item.name}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-sm pixel-btn text-xs font-mono flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            <span>ESC</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 overflow-hidden items-center justify-center">
          <div className="flex-1 w-full h-full flex items-center justify-center bg-black/50 border-2 border-slate-700/80 p-2 overflow-hidden">
            <img
              src={item.url}
              alt={item.name}
              referrerPolicy="no-referrer"
              className="max-h-[60vh] max-w-full object-contain shadow-2xl rounded-xs"
            />
          </div>

          {/* Stats Column */}
          <div className="w-full md:w-72 bg-slate-900/90 border-2 border-blue-950 p-4 space-y-4 font-mono text-sm shrink-0">
            <div className="border-b border-slate-800 pb-2">
              <div className="font-pixel text-[10px] text-slate-400">STATUS SCHEDA</div>
              <div className="text-lg font-bold text-amber-300 font-vt tracking-wider">{item.name}</div>
              <div className="text-xs text-slate-400">{tier.title} · LVL {lvl}</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">PUNTEGGIO ELO</span>
                <span className="font-bold text-amber-400 font-mono tabular-nums text-sm">{item.elo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">PICCO MASSIMO</span>
                <span className="font-bold text-slate-200 tabular-nums">{item.peakElo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">DUELLI GIOCATI</span>
                <span className="font-bold text-slate-200 tabular-nums">{item.matches}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">VITTORIE (W)</span>
                <span className="font-bold text-emerald-400 tabular-nums">{item.wins}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">SCONFITTE (L)</span>
                <span className="font-bold text-red-400 tabular-nums">{item.losses}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">PAREGGI</span>
                <span className="font-bold text-amber-400 tabular-nums">{item.draws}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">TASSO VITTORIA</span>
                <span className="font-bold text-cyan-400 tabular-nums">
                  {item.matches > 0 ? `${Math.round((item.wins / item.matches) * 100)}%` : '0%'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 bg-blue-700 hover:bg-blue-600 pixel-btn font-pixel text-[11px] text-white cursor-pointer mt-2"
            >
              CHIUDI FINESTRA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
