import React, { useState, useRef, useEffect } from 'react';
import { FolderOpen, Upload, ShieldCheck, ArrowRight, Trash2 } from 'lucide-react';
import { ImageItem } from '../utils/elo';
import { fileToDataUrl } from '../utils/imageUtils';
import { playSelectSound, playCursorMove } from '../utils/sound';

interface SetupScreenProps {
  onStartQuest: (title: string, items: ImageItem[], folderName?: string) => void;
  savedSessionAvailable: boolean;
  savedSessionTitle?: string;
  savedSessionFolder?: string;
  onRestoreSession: () => void;
  onImportJsonSession: (file: File) => void;
  onResetAll?: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onStartQuest,
  savedSessionAvailable,
  savedSessionTitle,
  savedSessionFolder,
  onRestoreSession,
  onImportJsonSession,
  onResetAll,
}) => {
  const [title, setTitle] = useState('La Grande Sfida Fotografica');
  const [customFolderPath, setCustomFolderPath] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loadingText, setLoadingText] = useState<string | null>(null);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  // Focus effect
  useEffect(() => {
    playSelectSound();
  }, []);

  const processFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    // Filter only image files
    const imageFiles = files.filter((f) => f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|avif|bmp|svg)$/i.test(f.name));

    if (imageFiles.length < 2) {
      alert('Seleziona almeno 2 immagini per poter effettuare confronti!');
      return;
    }

    setLoadingText(`Collegamento a ${imageFiles.length} foto nella cartella originale...`);

    try {
      let detectedFolderName: string | undefined = customFolderPath.trim() || undefined;

      // Extract relative path structure if custom folder path wasn't manually specified
      if (!detectedFolderName) {
        const firstWithRelPath = imageFiles.find((f) => f.webkitRelativePath);
        if (firstWithRelPath && firstWithRelPath.webkitRelativePath) {
          const parts = firstWithRelPath.webkitRelativePath.split('/');
          if (parts.length > 1) {
            detectedFolderName = parts.slice(0, -1).join('\\');
          } else {
            detectedFolderName = parts[0];
          }
        }
      }

      const items: ImageItem[] = imageFiles.map((file, index) => {
        const objectUrl = URL.createObjectURL(file);
        const relPath = file.webkitRelativePath || '';

        return {
          id: `img-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          url: objectUrl,
          relativePath: relPath || undefined,
          size: file.size,
          lastModified: file.lastModified,
          elo: 1200,
          matches: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          peakElo: 1200,
        };
      });

      playSelectSound();
      onStartQuest(title.trim() || 'Sfida Senza Nome', items, detectedFolderName);
    } catch (err) {
      console.error(err);
      alert('Errore durante il collegamento delle immagini.');
    } finally {
      setLoadingText(null);
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-4">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderChange}
        // @ts-expect-error webkitdirectory attribute is standard in browsers for directory upload
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={jsonInputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) onImportJsonSession(e.target.files[0]);
        }}
        accept=".json"
        className="hidden"
      />

      <div className="w-full max-w-2xl rpg-window p-6 sm:p-8 text-white relative">
        {/* Retro Header Banner */}
        <div className="text-center mb-6 border-b-2 border-blue-900 pb-4">
          <div className="text-amber-400 font-pixel text-xs tracking-widest mb-1.5 flex items-center justify-center gap-2">
            <span>★</span> PHOTO BATTLE <span>★</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-vt text-amber-300 tracking-wider">
            INIZIA UNA NUOVA SFIDA
          </h1>
          <p className="text-xs text-slate-300 font-mono mt-1">
            Seleziona una cartella del tuo computer. Le foto si sfideranno a coppie con algoritmo Elo.
          </p>
        </div>

        {loadingText ? (
          <div className="py-12 text-center space-y-3 font-pixel text-xs text-amber-400 animate-pulse">
            <div>[ CARICAMENTO FILE IN CORSO ]</div>
            <div className="text-[10px] text-slate-300">{loadingText}</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quest Title Input */}
            <div className="space-y-2">
              <label className="block font-pixel text-[11px] text-amber-300">
                1. TITOLO DELLA SFIDA
              </label>
              <div className="bg-slate-900/90 border-2 border-blue-800 p-2 focus-within:border-amber-400">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Es. Foto Vacanze 2024, Selezione Portfolio..."
                  className="w-full bg-transparent text-white font-mono text-sm sm:text-base outline-hidden px-1"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Assegna un nome per identificare questa sessione di confronto.
              </p>
            </div>

            {/* Folder & Files Picker Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block font-pixel text-[11px] text-amber-300">
                  2. PERCORSO CARTELLA (ES. D:\IMMAGINI\ARTISTI VARI)
                </label>
                <div className="bg-slate-900/90 border-2 border-blue-800 p-2 focus-within:border-amber-400 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                  <input
                    type="text"
                    value={customFolderPath}
                    onChange={(e) => setCustomFolderPath(e.target.value)}
                    placeholder="Es: D:\IMMAGINI\ARTISTI VARI"
                    className="w-full bg-transparent text-amber-200 font-mono text-xs sm:text-sm outline-hidden font-bold"
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Puoi inserire o modificare l'intero percorso (es. <code className="text-amber-300">D:\IMMAGINI\ARTISTI VARI</code>). Verrà salvato nella sessione per ricordarti sempre la posizione dei file.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block font-pixel text-[11px] text-amber-300">
                  3. SELEZIONE IMMAGINI DAL TUO COMPUTER
                </label>

                {/* Drag and Drop Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed p-6 text-center transition-all ${
                    isDragging
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-blue-700/80 bg-slate-900/60 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          playCursorMove();
                          folderInputRef.current?.click();
                        }}
                        className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs rounded-xs pixel-btn flex items-center gap-2 cursor-pointer shadow-lg font-bold"
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span>SCEGLI CARTELLA</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playCursorMove();
                          fileInputRef.current?.click();
                        }}
                        className="px-3 py-3 bg-blue-700 hover:bg-blue-600 text-white font-pixel text-[11px] rounded-xs pixel-btn flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>SELEZIONA FILE</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 font-mono mt-1">
                      oppure trascina la cartella o le immagini qui dentro
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alternative option: Restore or Load session & Reset All */}
            <div className="pt-2 border-t border-blue-900/60 flex flex-wrap items-center justify-between gap-2">
              {onResetAll ? (
                <button
                  type="button"
                  onClick={onResetAll}
                  className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/80 font-pixel text-[10px] rounded-xs pixel-btn flex items-center gap-1.5 cursor-pointer font-bold"
                  title="Cancella la memoria locale e azzera tutti i salvataggi"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>RESET ALL</span>
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={() => {
                  playCursorMove();
                  jsonInputRef.current?.click();
                }}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-pixel text-[10px] rounded-xs pixel-btn flex items-center justify-center gap-2 cursor-pointer font-bold"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-300" />
                <span>CARICA SESSIONE (LOAD)</span>
              </button>
            </div>

            {/* Saved session banner */}
            {savedSessionAvailable && (
              <div className="p-3.5 bg-amber-950/40 border-2 border-amber-600/80 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <span>★</span>
                    <span>Sessione precedente trovata:</span>
                  </div>
                  <div className="text-slate-100 font-bold truncate max-w-sm text-sm">
                    "{savedSessionTitle || 'Sfida precedente'}"
                  </div>
                  {savedSessionFolder && (
                    <div className="text-[11px] text-amber-300/90 flex items-start gap-1.5 pt-0.5">
                      <FolderOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-slate-400 text-[10px]">Percorso completo cartella:</span>
                        <code className="text-amber-200 bg-slate-900/90 px-2 py-1 rounded-xs border border-amber-500/40 font-mono font-bold break-all inline-block mt-0.5 text-xs">
                          {savedSessionFolder}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSelectSound();
                    onRestoreSession();
                  }}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-[10px] rounded-xs pixel-btn flex items-center justify-center gap-1.5 cursor-pointer shrink-0 font-bold self-start sm:self-center shadow-md"
                >
                  <span>RIPRENDI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Privacy Guarantee Box */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono bg-blue-950/40 border border-blue-900/60 p-2.5 rounded-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>100% Riservato & Locale</strong>: I file non lasciano mai il tuo computer. L'elaborazione e i confronti avvengono interamente nel tuo browser.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
