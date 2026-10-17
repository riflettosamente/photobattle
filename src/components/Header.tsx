import React, { useRef } from 'react';
import { Volume2, VolumeX, Save, Upload, RotateCcw, Swords, Trophy, History, Trash2 } from 'lucide-react';
import { playCursorMove, playSelectSound } from '../utils/sound';

interface HeaderProps {
  activeTab: 'duel' | 'leaderboard' | 'history';
  onSelectTab: (tab: 'duel' | 'leaderboard' | 'history') => void;
  title: string;
  itemCount: number;
  totalBattles: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSaveSession: () => void;
  onLoadSession: (file: File) => void;
  onNewSession: () => void;
  onResetAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  title,
  itemCount,
  totalBattles,
  soundEnabled,
  onToggleSound,
  onSaveSession,
  onLoadSession,
  onNewSession,
  onResetAll,
}) => {
  const loadFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      playSelectSound();
      onLoadSession(e.target.files[0]);
      e.target.value = ''; // Reset input so same file can be reloaded if needed
    }
  };

  return (
    <header className="w-full bg-slate-950/90 border-b-2 border-blue-900/60 sticky top-0 z-40 backdrop-blur-xs">
      {/* Hidden file input for Load session */}
      <input
        type="file"
        ref={loadFileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Zone 1: Single element brand wordmark */}
        <div className="flex items-center gap-3">
          <span className="font-pixel text-sm sm:text-base text-amber-400 tracking-wider flex items-center gap-2">
            <span className="text-red-500">⚔</span> PHOTO BATTLE
          </span>
          {title && (
            <span className="hidden lg:inline text-xs font-mono text-slate-400 border-l border-slate-700 pl-3 truncate max-w-xs">
              QUEST: <strong className="text-slate-200">{title}</strong> ({itemCount} foto · {totalBattles} duelli)
            </span>
          )}
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-4 font-mono text-xs sm:text-sm">
          <button
            onClick={() => {
              playCursorMove();
              onSelectTab('duel');
            }}
            className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'duel'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span className="hidden sm:inline">DUELLO</span>
          </button>

          <button
            onClick={() => {
              playCursorMove();
              onSelectTab('leaderboard');
            }}
            className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>CLASSIFICA</span>
          </button>

          <button
            onClick={() => {
              playCursorMove();
              onSelectTab('history');
            }}
            className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">REGISTRO</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Disattiva effetti 8-bit (Tasto M)' : 'Attiva effetti 8-bit (Tasto M)'}
            className="p-1.5 text-slate-400 hover:text-amber-300 bg-slate-900 border border-slate-700 rounded-xs pixel-btn cursor-pointer transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={onSaveSession}
            title="Salva ed Esporta Sessione (JSON)"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-blue-100 text-xs font-mono rounded-xs pixel-btn cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>SALVA</span>
          </button>

          <button
            onClick={() => {
              playCursorMove();
              loadFileInputRef.current?.click();
            }}
            title="Carica una Sessione salvata in precedenza (.json)"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-mono rounded-xs pixel-btn cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>LOAD</span>
          </button>

          <button
            onClick={onNewSession}
            title="Inizia una nuova sfida con un'altra cartella"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-xs pixel-btn cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">CAMBIA CARTELLA</span>
          </button>

          <button
            onClick={onResetAll}
            title="Cancella tutti i dati memorizzati nel browser ed azzera l'applicazione"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-900/90 hover:bg-rose-800 text-rose-100 text-xs font-mono rounded-xs pixel-btn cursor-pointer border border-rose-700/80 font-bold"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-300" />
            <span className="hidden sm:inline">RESET ALL</span>
          </button>
        </div>
      </div>
    </header>
  );
};
