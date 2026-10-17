import React from 'react';
import { History, Swords, Undo2, ArrowRight } from 'lucide-react';
import { BattleRecord, ImageItem } from '../utils/elo';

interface HistoryScreenProps {
  history: BattleRecord[];
  items: ImageItem[];
  onUndoLast: () => void;
  canUndo: boolean;
  onReturnToDuel: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  items,
  onUndoLast,
  canUndo,
  onReturnToDuel,
}) => {
  const itemMap = new Map(items.map((i) => [i.id, i]));

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4 font-mono">
      <div className="rpg-window p-4 flex items-center justify-between">
        <div>
          <div className="font-pixel text-xs text-amber-400 mb-1 flex items-center gap-2">
            <History className="w-4 h-4" />
            <span>REGISTRO DEI DUELLI</span>
          </div>
          <p className="text-xs text-slate-300">
            Cronologia degli scontri disputati in questa sessione.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canUndo && (
            <button
              onClick={onUndoLast}
              className="px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-200 text-xs pixel-btn cursor-pointer flex items-center gap-1.5"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>ANNULLA ULTIMO</span>
            </button>
          )}
          <button
            onClick={onReturnToDuel}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs pixel-btn cursor-pointer flex items-center gap-1 font-bold"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>DUELLA</span>
          </button>
        </div>
      </div>

      <div className="rpg-window p-4 space-y-2 max-h-[65vh] overflow-y-auto">
        {history.length === 0 ? (
          <div className="py-12 text-center font-pixel text-xs text-slate-400">
            Nessun duello ancora disputato. Inizia a votare per popolare il registro!
          </div>
        ) : (
          [...history].reverse().map((rec, index) => {
            const itemA = itemMap.get(rec.itemAId);
            const itemB = itemMap.get(rec.itemBId);
            const isWinnerA = rec.winnerId === rec.itemAId;
            const isWinnerB = rec.winnerId === rec.itemBId;
            const isDraw = rec.winnerId === 'DRAW';

            return (
              <div
                key={rec.id || index}
                className="p-3 bg-slate-950/80 border border-slate-800 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 text-slate-400 text-[11px] shrink-0 font-pixel">
                  <span>#{history.length - index}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center gap-3 w-full sm:w-auto">
                  {/* Sfidante A */}
                  <div
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-xs border ${
                      isWinnerA
                        ? 'border-emerald-500/80 bg-emerald-950/40 text-emerald-300 font-bold'
                        : isDraw
                        ? 'border-amber-600/50 bg-amber-950/20 text-slate-300'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400'
                    }`}
                  >
                    {itemA?.url && (
                      <img
                        src={itemA.url}
                        alt=""
                        className="w-5 h-5 object-cover rounded-xs"
                      />
                    )}
                    <span className="truncate max-w-[120px]">{itemA?.name || 'Immagine A'}</span>
                    <span className="font-pixel text-[9px] tabular-nums">
                      {rec.eloDeltaA > 0 ? `+${rec.eloDeltaA}` : rec.eloDeltaA}
                    </span>
                  </div>

                  <span className="text-amber-400 font-pixel text-[10px]">VS</span>

                  {/* Sfidante B */}
                  <div
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-xs border ${
                      isWinnerB
                        ? 'border-emerald-500/80 bg-emerald-950/40 text-emerald-300 font-bold'
                        : isDraw
                        ? 'border-amber-600/50 bg-amber-950/20 text-slate-300'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400'
                    }`}
                  >
                    {itemB?.url && (
                      <img
                        src={itemB.url}
                        alt=""
                        className="w-5 h-5 object-cover rounded-xs"
                      />
                    )}
                    <span className="truncate max-w-[120px]">{itemB?.name || 'Immagine B'}</span>
                    <span className="font-pixel text-[9px] tabular-nums">
                      {rec.eloDeltaB > 0 ? `+${rec.eloDeltaB}` : rec.eloDeltaB}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right font-pixel text-[10px]">
                  {isWinnerA ? (
                    <span className="text-emerald-400">VITTORIA A</span>
                  ) : isWinnerB ? (
                    <span className="text-emerald-400">VITTORIA B</span>
                  ) : (
                    <span className="text-amber-400">PAREGGIO</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
