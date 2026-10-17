import React, { useRef } from 'react';
import { FolderOpen, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ImageItem } from '../utils/elo';
import { relinkItemsWithFiles } from '../utils/imageUtils';
import { playSelectSound } from '../utils/sound';

interface FolderRelinkModalProps {
  missingCount: number;
  totalCount: number;
  folderName?: string;
  items: ImageItem[];
  onRelinkSuccess: (updatedItems: ImageItem[]) => void;
  onClose: () => void;
}

export const FolderRelinkModal: React.FC<FolderRelinkModalProps> = ({
  missingCount,
  totalCount,
  folderName,
  items,
  onRelinkSuccess,
  onClose,
}) => {
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    
    const { updatedItems, matchedCount } = relinkItemsWithFiles(items, files);
    
    if (matchedCount === 0) {
      alert('Nessuna immagine trovata corrispondente ai nomi della sessione. Assicurati di selezionare la cartella corretta!');
      return;
    }

    playSelectSound();
    onRelinkSuccess(updatedItems);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Hidden folder input */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderChange}
        // @ts-expect-error webkitdirectory is browser-standard for folder selection
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
      />

      <div className="w-full max-w-lg rpg-window p-6 text-white relative animate-fade-in space-y-5">
        <div className="flex items-center gap-3 border-b-2 border-amber-500/80 pb-3">
          <div className="p-2 bg-amber-500/20 border border-amber-400 rounded-xs text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-vt text-2xl text-amber-300 font-bold tracking-wide">
              RICOLLEGA CARTELLA IMMAGINI
            </h2>
            <p className="text-xs text-slate-300 font-mono">
              Sessione caricata: {totalCount} foto in classifica.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-200 font-mono leading-relaxed">
          Hai caricato i dati di una sessione salvata. Per poter visualizzare le foto, seleziona sul tuo computer la cartella contenente i file originali ({missingCount} di {totalCount} foto da ricollegare).
        </p>

        {folderName && (
          <div className="bg-amber-950/60 border-2 border-amber-500/80 p-3.5 rounded-xs text-xs font-mono space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Percorso cartella salvato:</span>
            </div>
            <code className="text-amber-200 bg-slate-900/90 px-2.5 py-1.5 rounded-xs border border-amber-500/50 font-mono font-bold break-all block text-xs sm:text-sm shadow-inner">
              {folderName}
            </code>
            <span className="text-[11px] text-slate-300 block pt-0.5">
              Seleziona la cartella situata in <strong className="text-amber-300">{folderName}</strong> per ricollegare tutte le foto.
            </span>
          </div>
        )}

        <div className="bg-slate-900/90 border border-blue-800/80 p-4 rounded-xs text-xs font-mono space-y-2">
          <div className="text-amber-400 font-bold">Cosa succederà:</div>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
            <li>I punteggi ELO, il numero di duelli e le statistiche rimarranno <strong>al 100% inalterati</strong>.</li>
            <li>L'applicazione associerà automaticamente ogni foto al relativo nome di file.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs rounded-xs pixel-btn flex items-center justify-center gap-2 font-bold cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span>SELEZIONA CARTELLA FOTO</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-xs rounded-xs pixel-btn cursor-pointer"
          >
            CONTINUA SENZA FOTO
          </button>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Nessun file viene caricato online. L'abbinamento avviene solo nel browser.</span>
        </div>
      </div>
    </div>
  );
};
