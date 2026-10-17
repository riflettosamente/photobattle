/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { SetupScreen } from './components/SetupScreen';
import { DuelScreen } from './components/DuelScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { ImageModal } from './components/ImageModal';
import { FolderRelinkModal } from './components/FolderRelinkModal';
import {
  ImageItem,
  SessionState,
  BattleRecord,
  calculateElo,
  selectNextPair,
  saveSessionToStorage,
  loadSessionFromStorage,
  clearSessionStorage,
} from './utils/elo';
import {
  playAttackSound,
  playDrawSound,
  playLevelUpSound,
  playSelectSound,
  isSoundEnabled,
  setSoundEnabled,
} from './utils/sound';

export default function App() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [currentPair, setCurrentPair] = useState<[ImageItem, ImageItem] | null>(null);
  const [activeTab, setActiveTab] = useState<'duel' | 'leaderboard' | 'history'>('duel');
  const [lastBattleLog, setLastBattleLog] = useState<string | null>(null);
  const [inspectedItem, setInspectedItem] = useState<ImageItem | null>(null);
  const [soundActive, setSoundActive] = useState(true);
  const [showRelinkModal, setShowRelinkModal] = useState(false);

  // Check saved session in localStorage on initial mount
  const [savedSessionMeta, setSavedSessionMeta] = useState<Partial<SessionState> | null>(null);

  useEffect(() => {
    const saved = loadSessionFromStorage();
    if (saved && saved.items && saved.items.length > 0) {
      setSavedSessionMeta(saved);
    }
  }, []);

  const toggleSound = useCallback(() => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
  }, [soundActive]);

  // Start new quest
  const handleStartQuest = useCallback((title: string, items: ImageItem[], folderName?: string) => {
    const newSession: SessionState = {
      title,
      folderName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items,
      history: [],
    };
    setSession(newSession);
    saveSessionToStorage(newSession);
    const initialPair = selectNextPair(items);
    setCurrentPair(initialPair);
    setActiveTab('duel');
    setLastBattleLog(`Nuova quest avviata: "${title}". ${items.length} immagini pronte al confronto!`);
  }, []);

  // Restore saved session metadata from localStorage
  const handleRestoreSession = useCallback(() => {
    if (!savedSessionMeta || !savedSessionMeta.items) return;
    const restoredItems = (savedSessionMeta.items as ImageItem[]).map((it) => ({
      ...it,
      url: it.dataUrl || it.url || '',
    }));
    const restoredSession: SessionState = {
      title: savedSessionMeta.title || 'Sfida Ripristinata',
      folderName: savedSessionMeta.folderName,
      createdAt: savedSessionMeta.createdAt || Date.now(),
      updatedAt: Date.now(),
      items: restoredItems,
      history: savedSessionMeta.history || [],
    };
    setSession(restoredSession);
    const pair = selectNextPair(restoredSession.items);
    setCurrentPair(pair);
    setActiveTab('duel');
    setLastBattleLog(`Sessione ripristinata: ${restoredSession.items.length} foto in classifica.`);

    // Check if any image is missing its URL
    const hasMissingUrls = restoredItems.some((it) => !it.url);
    if (hasMissingUrls) {
      setShowRelinkModal(true);
    }
  }, [savedSessionMeta]);

  // Import JSON session backup
  const handleImportJsonSession = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!parsed.items || !Array.isArray(parsed.items)) {
          alert('Il file non contiene una sessione valida di Photo Battle.');
          return;
        }

        const normalizedItems: ImageItem[] = parsed.items.map((it: ImageItem) => ({
          ...it,
          url: it.dataUrl || it.url || '',
        }));

        const imported: SessionState = {
          title: parsed.title || 'Sessione Importata',
          folderName: parsed.folderName,
          createdAt: parsed.createdAt || Date.now(),
          updatedAt: Date.now(),
          items: normalizedItems,
          history: parsed.history || [],
        };

        setSession(imported);
        saveSessionToStorage(imported);
        const pair = selectNextPair(imported.items);
        setCurrentPair(pair);
        setActiveTab('duel');
        setLastBattleLog(`Sessione importata con successo: ${imported.items.length} foto caricate!`);

        // Check if images are missing URLs and prompt to relink
        const missingCount = normalizedItems.filter((it) => !it.url).length;
        if (missingCount > 0) {
          setShowRelinkModal(true);
        }
      } catch (err) {
        console.error(err);
        alert('Errore nella lettura del file JSON.');
      }
    };
    reader.readAsText(file);
  }, []);

  // Relink images from a selected folder
  const handleRelinkSuccess = useCallback(
    (updatedItems: ImageItem[]) => {
      if (!session) return;
      const nextSession: SessionState = {
        ...session,
        updatedAt: Date.now(),
        items: updatedItems,
      };
      setSession(nextSession);
      saveSessionToStorage(nextSession);
      setShowRelinkModal(false);
      const pair = selectNextPair(updatedItems);
      setCurrentPair(pair);
      setLastBattleLog(`Cartella foto ricollegata con successo! ${updatedItems.filter((it) => !!it.url).length} immagini ripristinate.`);
    },
    [session]
  );

  // Perform a duel vote
  const handleVote = useCallback(
    (choice: 'A' | 'B' | 'DRAW') => {
      if (!session || !currentPair) return;

      const [itemA, itemB] = currentPair;
      const outcome = choice === 'A' ? 1 : choice === 'B' ? 0 : 0.5;

      const { newA, newB, deltaA, deltaB } = calculateElo(
        itemA.elo,
        itemB.elo,
        outcome,
        itemA.matches,
        itemB.matches
      );

      // Sound and visual feedback
      if (choice === 'DRAW') {
        playDrawSound();
      } else {
        playAttackSound();
        if (Math.abs(deltaA) >= 20 || Math.abs(deltaB) >= 20) {
          setTimeout(() => playLevelUpSound(), 140);
        }
      }

      // Record battle
      const battleRecord: BattleRecord = {
        id: `battle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        itemAId: itemA.id,
        itemBId: itemB.id,
        winnerId: choice === 'A' ? itemA.id : choice === 'B' ? itemB.id : 'DRAW',
        eloDeltaA: deltaA,
        eloDeltaB: deltaB,
      };

      // Update state for items
      const updatedItems = session.items.map((it) => {
        if (it.id === itemA.id) {
          const nextElo = newA;
          return {
            ...it,
            elo: nextElo,
            matches: it.matches + 1,
            wins: it.wins + (choice === 'A' ? 1 : 0),
            losses: it.losses + (choice === 'B' ? 1 : 0),
            draws: it.draws + (choice === 'DRAW' ? 1 : 0),
            peakElo: Math.max(it.peakElo, nextElo),
          };
        }
        if (it.id === itemB.id) {
          const nextElo = newB;
          return {
            ...it,
            elo: nextElo,
            matches: it.matches + 1,
            wins: it.wins + (choice === 'B' ? 1 : 0),
            losses: it.losses + (choice === 'A' ? 1 : 0),
            draws: it.draws + (choice === 'DRAW' ? 1 : 0),
            peakElo: Math.max(it.peakElo, nextElo),
          };
        }
        return it;
      });

      const updatedHistory = [...session.history, battleRecord];
      const nextSession: SessionState = {
        ...session,
        updatedAt: Date.now(),
        items: updatedItems,
        history: updatedHistory,
      };

      setSession(nextSession);
      saveSessionToStorage(nextSession);

      // Log message
      let logMsg = '';
      if (choice === 'A') {
        logMsg = `SFIDANTE A (${itemA.name}) vince! (+${deltaA} ELO) · SFIDANTE B (${itemB.name}) cede il passo (${deltaB} ELO).`;
      } else if (choice === 'B') {
        logMsg = `SFIDANTE B (${itemB.name}) vince! (+${deltaB} ELO) · SFIDANTE A (${itemA.name}) cede il passo (${deltaA} ELO).`;
      } else {
        logMsg = `PAREGGIO tra "${itemA.name}" (${deltaA >= 0 ? `+${deltaA}` : deltaA}) e "${itemB.name}" (${deltaB >= 0 ? `+${deltaB}` : deltaB}).`;
      }
      setLastBattleLog(logMsg);

      // Pick next pair
      const nextPair = selectNextPair(updatedItems, [itemA.id, itemB.id]);
      setCurrentPair(nextPair);
    },
    [session, currentPair]
  );

  // Undo last battle
  const handleUndoLast = useCallback(() => {
    if (!session || session.history.length === 0) return;

    const lastBattle = session.history[session.history.length - 1];
    const prevHistory = session.history.slice(0, -1);

    const revertedItems = session.items.map((it) => {
      if (it.id === lastBattle.itemAId) {
        return {
          ...it,
          elo: it.elo - lastBattle.eloDeltaA,
          matches: Math.max(0, it.matches - 1),
          wins: it.wins - (lastBattle.winnerId === lastBattle.itemAId ? 1 : 0),
          losses: it.losses - (lastBattle.winnerId === lastBattle.itemBId ? 1 : 0),
          draws: it.draws - (lastBattle.winnerId === 'DRAW' ? 1 : 0),
        };
      }
      if (it.id === lastBattle.itemBId) {
        return {
          ...it,
          elo: it.elo - lastBattle.eloDeltaB,
          matches: Math.max(0, it.matches - 1),
          wins: it.wins - (lastBattle.winnerId === lastBattle.itemBId ? 1 : 0),
          losses: it.losses - (lastBattle.winnerId === lastBattle.itemAId ? 1 : 0),
          draws: it.draws - (lastBattle.winnerId === 'DRAW' ? 1 : 0),
        };
      }
      return it;
    });

    const nextSession: SessionState = {
      ...session,
      updatedAt: Date.now(),
      items: revertedItems,
      history: prevHistory,
    };

    setSession(nextSession);
    saveSessionToStorage(nextSession);
    setLastBattleLog('Ultimo duello annullato con successo!');
    const freshPair = selectNextPair(revertedItems);
    setCurrentPair(freshPair);
  }, [session]);

  // Export ranking as CSV
  const handleExportCsv = useCallback(() => {
    if (!session) return;
    const sorted = [...session.items].sort((a, b) => b.elo - a.elo);
    const headers = ['Posizione', 'Nome File', 'Punteggio Elo', 'Duelli Giocati', 'Vittorie', 'Sconfitte', 'Pareggi', 'Win Rate %'];
    const rows = sorted.map((it, idx) => {
      const winRate = it.matches > 0 ? Math.round((it.wins / it.matches) * 100) : 0;
      return [
        idx + 1,
        `"${it.name.replace(/"/g, '""')}"`,
        it.elo,
        it.matches,
        it.wins,
        it.losses,
        it.draws,
        `${winRate}%`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const safeTitle = session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', `classifica_${safeTitle}_elo.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [session]);

  // Export session JSON (Lightweight metadata file)
  const handleExportJson = useCallback(() => {
    if (!session) return;
    const exportableItems = session.items.map(({ id, name, relativePath, size, lastModified, elo, matches, wins, losses, draws, peakElo }) => ({
      id,
      name,
      relativePath,
      size,
      lastModified,
      elo,
      matches,
      wins,
      losses,
      draws,
      peakElo,
    }));

    const exportData = {
      title: session.title,
      folderName: session.folderName,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      items: exportableItems,
      history: session.history,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `sessione_${safeTitle}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [session]);

  // Reset / change folder
  const handleNewSession = useCallback(() => {
    if (confirm('Vuoi iniziare una nuova sfida con una cartella differente? La sessione attuale rimarrà comunque salvata nella memoria locale.')) {
      setSession(null);
      setCurrentPair(null);
      setLastBattleLog(null);
    }
  }, []);

  // Reset ALL session data completely
  const handleResetAll = useCallback(() => {
    if (
      window.confirm(
        '⚠️ RESET COMPLETO:\n\nSei sicuro di voler azzerare tutto?\n\nQuesta azione cancellerà la sessione corrente e tutte le sessioni memorizzate nel browser.'
      )
    ) {
      clearSessionStorage();
      try {
        localStorage.clear();
      } catch {
        // ignore
      }
      setSession(null);
      setCurrentPair(null);
      setSavedSessionMeta(null);
      setShowRelinkModal(false);
      setInspectedItem(null);
      setLastBattleLog(null);
      playSelectSound();
    }
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Close modal with Escape
      if (e.key === 'Escape' && inspectedItem) {
        setInspectedItem(null);
        return;
      }

      // Mute toggle
      if (e.key.toLowerCase() === 'm') {
        toggleSound();
        return;
      }

      // Tab switcher
      if (e.key === '1' && session) setActiveTab('duel');
      if (e.key === '2' && session) setActiveTab('leaderboard');
      if (e.key === '3' && session) setActiveTab('history');

      // Duel choices (only when on duel tab and not inspecting modal)
      if (session && activeTab === 'duel' && currentPair && !inspectedItem) {
        if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
          e.preventDefault();
          handleVote('A');
        } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
          e.preventDefault();
          handleVote('B');
        } else if (e.key === ' ' || e.key.toLowerCase() === 's') {
          e.preventDefault();
          handleVote('DRAW');
        } else if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          handleUndoLast();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, activeTab, currentPair, inspectedItem, toggleSound, handleVote, handleUndoLast]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 relative overflow-x-hidden">
      {/* Subtle CRT scanline overlay */}
      <div className="fixed inset-0 crt-scanlines z-50 pointer-events-none opacity-25" />

      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        title={session?.title || ''}
        itemCount={session?.items.length || 0}
        totalBattles={session?.history.length || 0}
        soundEnabled={soundActive}
        onToggleSound={toggleSound}
        onSaveSession={handleExportJson}
        onLoadSession={handleImportJsonSession}
        onNewSession={handleNewSession}
        onResetAll={handleResetAll}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-2">
        {!session ? (
          <SetupScreen
            onStartQuest={handleStartQuest}
            savedSessionAvailable={Boolean(savedSessionMeta && savedSessionMeta.items?.length)}
            savedSessionTitle={savedSessionMeta?.title}
            savedSessionFolder={savedSessionMeta?.folderName}
            onRestoreSession={handleRestoreSession}
            onImportJsonSession={handleImportJsonSession}
            onResetAll={handleResetAll}
          />
        ) : activeTab === 'duel' ? (
          currentPair ? (
            <DuelScreen
              itemA={currentPair[0]}
              itemB={currentPair[1]}
              battleCount={session.history.length}
              totalItems={session.items.length}
              lastBattleLog={lastBattleLog}
              onVote={handleVote}
              onInspect={setInspectedItem}
              onUndoLast={handleUndoLast}
              canUndo={session.history.length > 0}
            />
          ) : (
            <div className="py-24 text-center font-pixel text-xs text-amber-400">
              [ NESSUNA COPPIA DISPONIBILE AL MOMENTO ]
            </div>
          )
        ) : activeTab === 'leaderboard' ? (
          <LeaderboardScreen
            items={session.items}
            title={session.title}
            totalBattles={session.history.length}
            onInspect={setInspectedItem}
            onReturnToDuel={() => setActiveTab('duel')}
            onExportCsv={handleExportCsv}
            onExportJson={handleExportJson}
          />
        ) : (
          <HistoryScreen
            history={session.history}
            items={session.items}
            onUndoLast={handleUndoLast}
            canUndo={session.history.length > 0}
            onReturnToDuel={() => setActiveTab('duel')}
          />
        )}
      </main>

      {/* High-res Image Inspection Modal */}
      <ImageModal item={inspectedItem} onClose={() => setInspectedItem(null)} />

      {/* Relink missing images modal */}
      {showRelinkModal && session && (
        <FolderRelinkModal
          missingCount={session.items.filter((it) => !it.url).length}
          totalCount={session.items.length}
          folderName={session.folderName}
          items={session.items}
          onRelinkSuccess={handleRelinkSuccess}
          onClose={() => setShowRelinkModal(false)}
        />
      )}
    </div>
  );
}
