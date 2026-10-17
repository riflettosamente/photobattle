import React, { useState } from 'react';
import { Maximize2, Swords, Shield, Sparkles, Undo2, Award } from 'lucide-react';
import { ImageItem, getRankTier, getRpgLevel } from '../utils/elo';

interface DuelScreenProps {
  itemA: ImageItem;
  itemB: ImageItem;
  battleCount: number;
  totalItems: number;
  lastBattleLog: string | null;
  onVote: (winner: 'A' | 'B' | 'DRAW') => void;
  onInspect: (item: ImageItem) => void;
  onUndoLast: () => void;
  canUndo: boolean;
}

export const DuelScreen: React.FC<DuelScreenProps> = ({
  itemA,
  itemB,
  battleCount,
  totalItems,
  lastBattleLog,
  onVote,
  onInspect,
  onUndoLast,
  canUndo,
}) => {
  const [animatingWinner, setAnimatingWinner] = useState<'A' | 'B' | 'DRAW' | null>(null);

  const handleChoose = (choice: 'A' | 'B' | 'DRAW') => {
    if (animatingWinner) return;
    setAnimatingWinner(choice);
    setTimeout(() => {
      onVote(choice);
      setAnimatingWinner(null);
    }, 220);
  };

  const tierA = getRankTier(itemA.elo);
  const tierB = getRankTier(itemB.elo);
  const lvlA = getRpgLevel(itemA.elo);
  const lvlB = getRpgLevel(itemB.elo);

  // HP gauge calculation (ratio normalized between 1000 and 1600 elo for visual bar)
  const hpPercentA = Math.min(100, Math.max(10, Math.round(((itemA.elo - 900) / 700) * 100)));
  const hpPercentB = Math.min(100, Math.max(10, Math.round(((itemB.elo - 900) / 700) * 100)));

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
      {/* Top HUD: Quest Progress & Duel Counter */}
      <div className="flex items-center justify-between font-pixel text-[11px] text-slate-300 bg-slate-900/80 border-2 border-blue-950 p-2.5 rounded-xs">
        <div className="flex items-center gap-2">
          <span className="text-amber-400">DUELLO #{battleCount + 1}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">{totalItems} FOTO IN LIZZA</span>
        </div>

        <div className="flex items-center gap-3">
          {canUndo && (
            <button
              onClick={onUndoLast}
              className="flex items-center gap-1 text-slate-400 hover:text-amber-300 text-[10px] font-mono cursor-pointer transition-colors"
              title="Annulla l'ultimo voto assegnato"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>ANNULLA ULTIMO</span>
            </button>
          )}
          <span className="text-[10px] text-amber-500 hidden sm:inline">
            COMANDI: [←] VOTA A &nbsp;|&nbsp; [→] VOTA B &nbsp;|&nbsp; [SPAZIO] PAREGGIA
          </span>
        </div>
      </div>

      {/* Main Battle Arena (Fighter A vs Fighter B) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 relative">
        {/* Floating VS Badge in Center (visible on desktop) */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex-col items-center pointer-events-none">
          <div className="rpg-window-crimson px-4 py-2 flex items-center gap-1.5 shadow-2xl animate-pulse">
            <Swords className="w-5 h-5 text-amber-300" />
            <span className="font-pixel text-base text-white tracking-widest">VS</span>
            <Swords className="w-5 h-5 text-amber-300 transform scale-x-[-1]" />
          </div>
        </div>

        {/* ================= FIGHTER A (LEFT) ================= */}
        <div
          className={`rpg-window flex flex-col transition-all duration-150 relative overflow-hidden group ${
            animatingWinner === 'A'
              ? 'ring-4 ring-amber-400 scale-[1.01]'
              : animatingWinner === 'B'
              ? 'opacity-60 scale-[0.99]'
              : 'hover:border-amber-400'
          }`}
        >
          {/* Top Card Header */}
          <div className="p-3 border-b-2 border-blue-900/80 bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-pixel text-xs text-amber-400 shrink-0">[ SFIDANTE A ]</span>
              <span className="font-vt text-lg text-slate-200 truncate">{itemA.name}</span>
            </div>
            <button
              onClick={() => onInspect(itemA)}
              className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xs pixel-btn cursor-pointer shrink-0 ml-2"
              title="Ispeziona a tutto schermo"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Photo Display Zone (Uncropped & Sharp) */}
          <div
            onClick={() => handleChoose('A')}
            className="flex-1 bg-black/60 min-h-[300px] sm:min-h-[380px] p-2 flex items-center justify-center cursor-pointer relative overflow-hidden group/img"
          >
            <img
              src={itemA.url}
              alt={itemA.name}
              referrerPolicy="no-referrer"
              className="max-h-[360px] max-w-full object-contain transition-transform duration-200 group-hover/img:scale-[1.02]"
            />
            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
              <span className="font-pixel text-xs bg-slate-950/90 text-amber-300 px-3 py-1.5 border border-amber-400 rounded-xs pixel-btn shadow-lg">
                CLICCA PER SCEGLIERE A
              </span>
            </div>
          </div>

          {/* Fighter A RPG Stats Box */}
          <div className="p-3 bg-slate-950/90 border-t-2 border-blue-900/80 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[10px] text-amber-300">LVL {lvlA}</span>
                <span className={`text-[10px] font-bold ${tierA.color}`}>[{tierA.title}]</span>
              </div>
              <div className="font-pixel text-xs text-amber-400 tabular-nums">
                ELO {itemA.elo}
              </div>
            </div>

            {/* HP / EXP Gauge Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>POTENZA BATTAGLIA</span>
                <span>{hpPercentA}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-900 border border-slate-700 rounded-xs overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-600 via-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${hpPercentA}%` }}
                />
              </div>
            </div>

            {/* Record stats */}
            <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              <span>RECORD: <strong className="text-emerald-400">{itemA.wins}W</strong> - <strong className="text-red-400">{itemA.losses}L</strong></span>
              <span>DUELLI: <strong className="text-slate-200">{itemA.matches}</strong></span>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => handleChoose('A')}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs rounded-xs pixel-btn cursor-pointer flex items-center justify-center gap-2 font-bold shadow-md"
            >
              <span>◄ SCEGLI QUESTA (TASTO FRECCIA SINISTRA)</span>
            </button>
          </div>
        </div>

        {/* ================= FIGHTER B (RIGHT) ================= */}
        <div
          className={`rpg-window flex flex-col transition-all duration-150 relative overflow-hidden group ${
            animatingWinner === 'B'
              ? 'ring-4 ring-amber-400 scale-[1.01]'
              : animatingWinner === 'A'
              ? 'opacity-60 scale-[0.99]'
              : 'hover:border-amber-400'
          }`}
        >
          {/* Top Card Header */}
          <div className="p-3 border-b-2 border-blue-900/80 bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-pixel text-xs text-amber-400 shrink-0">[ SFIDANTE B ]</span>
              <span className="font-vt text-lg text-slate-200 truncate">{itemB.name}</span>
            </div>
            <button
              onClick={() => onInspect(itemB)}
              className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xs pixel-btn cursor-pointer shrink-0 ml-2"
              title="Ispeziona a tutto schermo"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Photo Display Zone (Uncropped & Sharp) */}
          <div
            onClick={() => handleChoose('B')}
            className="flex-1 bg-black/60 min-h-[300px] sm:min-h-[380px] p-2 flex items-center justify-center cursor-pointer relative overflow-hidden group/img"
          >
            <img
              src={itemB.url}
              alt={itemB.name}
              referrerPolicy="no-referrer"
              className="max-h-[360px] max-w-full object-contain transition-transform duration-200 group-hover/img:scale-[1.02]"
            />
            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
              <span className="font-pixel text-xs bg-slate-950/90 text-amber-300 px-3 py-1.5 border border-amber-400 rounded-xs pixel-btn shadow-lg">
                CLICCA PER SCEGLIERE B
              </span>
            </div>
          </div>

          {/* Fighter B RPG Stats Box */}
          <div className="p-3 bg-slate-950/90 border-t-2 border-blue-900/80 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[10px] text-amber-300">LVL {lvlB}</span>
                <span className={`text-[10px] font-bold ${tierB.color}`}>[{tierB.title}]</span>
              </div>
              <div className="font-pixel text-xs text-amber-400 tabular-nums">
                ELO {itemB.elo}
              </div>
            </div>

            {/* HP / EXP Gauge Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>POTENZA BATTAGLIA</span>
                <span>{hpPercentB}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-900 border border-slate-700 rounded-xs overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-600 via-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${hpPercentB}%` }}
                />
              </div>
            </div>

            {/* Record stats */}
            <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              <span>RECORD: <strong className="text-emerald-400">{itemB.wins}W</strong> - <strong className="text-red-400">{itemB.losses}L</strong></span>
              <span>DUELLI: <strong className="text-slate-200">{itemB.matches}</strong></span>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => handleChoose('B')}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs rounded-xs pixel-btn cursor-pointer flex items-center justify-center gap-2 font-bold shadow-md"
            >
              <span>SCEGLI QUESTA (TASTO FRECCIA DESTRA) ►</span>
            </button>
          </div>
        </div>
      </div>

      {/* Draw / Skip Option */}
      <div className="flex justify-center">
        <button
          onClick={() => handleChoose('DRAW')}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs rounded-xs pixel-btn flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Shield className="w-4 h-4 text-amber-400" />
          <span>PAREGGIO / SALTA QUESTO DUELLO (BARRA SPAZIATRICE)</span>
        </button>
      </div>

      {/* Classic JRPG Battle Log Window */}
      <div className="rpg-window p-3 font-mono text-xs flex items-center gap-3">
        <div className="font-pixel text-[10px] text-amber-400 shrink-0 bg-blue-950 px-2 py-1 border border-blue-800">
          LOG BATTAGLIA
        </div>
        <div className="text-slate-200 truncate flex-1">
          {lastBattleLog || "L'arena è pronta. Scegli l'immagine migliore per decretare il vincitore del duello!"}
        </div>
      </div>
    </div>
  );
};
