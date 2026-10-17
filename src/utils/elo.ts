export interface ImageItem {
  id: string;
  name: string;
  url: string; // Active display URL (Blob object URL or base64)
  dataUrl?: string; // Persistent base64 image data for JSON export & offline restore
  relativePath?: string; // Relative path inside selected folder (e.g., 'Vacanze2024/foto1.jpg')
  size: number;
  lastModified?: number;
  elo: number; // starts at 1200
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  peakElo: number;
}

export interface BattleRecord {
  id: string;
  timestamp: number;
  itemAId: string;
  itemBId: string;
  winnerId: string | 'DRAW';
  eloDeltaA: number;
  eloDeltaB: number;
}

export interface SessionState {
  title: string;
  folderName?: string; // Original folder name (e.g. 'FotoVacanze2024')
  createdAt: number;
  updatedAt: number;
  items: ImageItem[];
  history: BattleRecord[];
}

export const INITIAL_ELO = 1200;

/**
 * Calculates updated Elo ratings given two opponents and the match outcome.
 * outcome: 1 (A won), 0 (B won), 0.5 (draw)
 */
export function calculateElo(
  ratingA: number,
  ratingB: number,
  outcome: 1 | 0 | 0.5,
  matchesA = 0,
  matchesB = 0
): { newA: number; newB: number; deltaA: number; deltaB: number } {
  // Expected scores
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedB = 1 - expectedA;

  // Adaptive K-Factor (higher for new participants to reach natural rank faster)
  const kA = matchesA < 10 ? 36 : matchesA < 25 ? 24 : 16;
  const kB = matchesB < 10 ? 36 : matchesB < 25 ? 24 : 16;

  const scoreA = outcome;
  const scoreB = 1 - outcome;

  const rawDeltaA = kA * (scoreA - expectedA);
  const rawDeltaB = kB * (scoreB - expectedB);

  const deltaA = Math.round(rawDeltaA);
  const deltaB = Math.round(rawDeltaB);

  return {
    newA: Math.max(100, ratingA + deltaA),
    newB: Math.max(100, ratingB + deltaB),
    deltaA,
    deltaB,
  };
}

/**
 * Derives a retro RPG "Level" from an Elo score.
 * Starts at Level 1 for 1000 ELO or lower, progressing as rating increases.
 */
export function getRpgLevel(elo: number): number {
  if (elo <= 1000) return 1;
  return Math.min(99, Math.max(1, Math.floor((elo - 1000) / 25) + 1));
}

/**
 * Assigns a retro JRPG rank/tier title based on Elo rating.
 */
export function getRankTier(elo: number): { title: string; color: string; border: string } {
  if (elo >= 1600) return { title: 'DIVINO', color: 'text-amber-300', border: 'border-amber-400' };
  if (elo >= 1450) return { title: 'LEGGENDARIO', color: 'text-purple-400', border: 'border-purple-400' };
  if (elo >= 1350) return { title: 'EROICO', color: 'text-blue-400', border: 'border-blue-400' };
  if (elo >= 1250) return { title: 'VETERANO', color: 'text-emerald-400', border: 'border-emerald-400' };
  if (elo >= 1150) return { title: 'AVVENTURIERO', color: 'text-slate-300', border: 'border-slate-400' };
  return { title: 'NOVIZIO', color: 'text-amber-700', border: 'border-amber-700' };
}

/**
 * Intelligent Matchmaking Pair Selection:
 * 1. Favors items with fewer matches to ensure comprehensive coverage.
 * 2. Pairs items with close Elo ratings so matches provide maximal information.
 * 3. Never pairs an item with itself or repeats the immediate previous battle.
 */
export function selectNextPair(
  items: ImageItem[],
  lastPairIds?: [string, string] | null
): [ImageItem, ImageItem] | null {
  if (items.length < 2) return null;

  // Sort items by least played first, with a mild random jitter
  const candidates = [...items].sort((a, b) => {
    const matchDiff = a.matches - b.matches;
    if (matchDiff !== 0) return matchDiff;
    return Math.random() - 0.5;
  });

  // Pick primary candidate from the bottom quartile of played matches
  const poolSize = Math.max(1, Math.ceil(candidates.length * 0.35));
  const primaryIndex = Math.floor(Math.random() * poolSize);
  const primary = candidates[primaryIndex];

  // For the opponent, find items not equal to primary
  const remaining = items.filter((item) => item.id !== primary.id);

  // Filter out immediate previous matchup if we have at least 3 items
  let validOpponents = remaining;
  if (items.length > 2 && lastPairIds) {
    const wasInLast = lastPairIds.includes(primary.id);
    if (wasInLast) {
      const otherId = lastPairIds[0] === primary.id ? lastPairIds[1] : lastPairIds[0];
      validOpponents = remaining.filter((item) => item.id !== otherId);
      if (validOpponents.length === 0) validOpponents = remaining;
    }
  }

  // Weight opponents by closeness of Elo rating and closeness of match count
  validOpponents.sort((a, b) => {
    const eloDistA = Math.abs(a.elo - primary.elo);
    const eloDistB = Math.abs(b.elo - primary.elo);
    const matchDistA = Math.abs(a.matches - primary.matches);
    const matchDistB = Math.abs(b.matches - primary.matches);

    const scoreA = eloDistA + matchDistA * 20 + Math.random() * 50;
    const scoreB = eloDistB + matchDistB * 20 + Math.random() * 50;
    return scoreA - scoreB;
  });

  // Pick among the top 3 best matching opponents
  const opponentPool = Math.min(3, validOpponents.length);
  const opponent = validOpponents[Math.floor(Math.random() * opponentPool)];

  // Randomize left/right presentation so candidate isn't always on left
  return Math.random() > 0.5 ? [primary, opponent] : [opponent, primary];
}

const STORAGE_KEY = 'pixel_arena_saved_session';

export function saveSessionToStorage(session: SessionState): void {
  try {
    const minimalItems = session.items.map(({ id, name, url, dataUrl, size, lastModified, elo, matches, wins, losses, draws, peakElo }) => ({
      id,
      name,
      // If item has a persistent dataUrl (base64), save it
      url: dataUrl || (url.startsWith('data:') ? url : ''),
      dataUrl,
      size,
      lastModified,
      elo,
      matches,
      wins,
      losses,
      draws,
      peakElo,
    }));

    const stateToSave = {
      title: session.title,
      folderName: session.folderName,
      createdAt: session.createdAt,
      updatedAt: Date.now(),
      items: minimalItems,
      history: session.history.slice(-100), // Keep last 100 battles in storage
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (err) {
    console.warn('Failed to save session to localStorage:', err);
  }
}

export function loadSessionFromStorage(): Partial<SessionState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load session from localStorage:', err);
    return null;
  }
}

export function clearSessionStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
