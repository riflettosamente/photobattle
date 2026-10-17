import React, { useState, useMemo } from 'react';
import { Trophy, Search, Download, Swords, Crown, Medal, Eye, ArrowUpDown, Sparkles } from 'lucide-react';
import { ImageItem, getRankTier, getRpgLevel } from '../utils/elo';

interface LeaderboardScreenProps {
  items: ImageItem[];
  title: string;
  totalBattles: number;
  onInspect: (item: ImageItem) => void;
  onReturnToDuel: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  items,
  title,
  totalBattles,
  onInspect,
  onReturnToDuel,
  onExportCsv,
  onExportJson,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'elo' | 'wins' | 'matches' | 'winrate'>('elo');

  const sortedItems = useMemo(() => {
    const list = [...items];
    switch (sortBy) {
      case 'elo':
        return list.sort((a, b) => b.elo - a.elo);
      case 'wins':
        return list.sort((a, b) => b.wins - a.wins || b.elo - a.elo);
      case 'matches':
        return list.sort((a, b) => b.matches - a.matches || b.elo - a.elo);
      case 'winrate':
        return list.sort((a, b) => {
          const rateA = a.matches > 0 ? a.wins / a.matches : 0;
          const rateB = b.matches > 0 ? b.wins / b.matches : 0;
          return rateB - rateA || b.elo - a.elo;
        });
      default:
        return list.sort((a, b) => b.elo - a.elo);
    }
  }, [items, sortBy]);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return sortedItems;
    const term = searchTerm.toLowerCase();
    return sortedItems.filter((i) => i.name.toLowerCase().includes(term));
  }, [sortedItems, searchTerm]);

  // Overall Top 3 for podium (always based on pure Elo)
  const topThree = useMemo(() => {
    return [...items].sort((a, b) => b.elo - a.elo).slice(0, 3);
  }, [items]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-5">
      {/* Top Banner & Quick Actions */}
      <div className="rpg-window p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-pixel text-xs text-amber-400 mb-1 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>HALL OF FAME · CLASSIFICA PARZIALE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-vt text-slate-100 tracking-wide">
            {title}
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            {items.length} immagini totali · {totalBattles} duelli disputati
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={onReturnToDuel}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs rounded-xs pixel-btn cursor-pointer flex items-center gap-1.5 font-bold shadow-md"
          >
            <Swords className="w-4 h-4" />
            <span>CONTINUA DUELLI</span>
          </button>

          <button
            onClick={onExportCsv}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xs pixel-btn cursor-pointer flex items-center gap-1.5"
            title="Scarica la classifica in formato foglio di calcolo (.csv)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>ESPORTA CSV</span>
          </button>

          <button
            onClick={onExportJson}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xs pixel-btn cursor-pointer flex items-center gap-1.5"
            title="Scarica file di sessione per riprendere in futuro (.json)"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>ESPORTA JSON</span>
          </button>
        </div>
      </div>

      {/* Podium for Top 3 (if at least 3 items exist) */}
      {topThree.length >= 3 && !searchTerm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
          {/* #2 Silver (Left) */}
          <div className="rpg-window p-3 order-2 md:order-1 flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-slate-300 font-pixel text-xs mb-2">
              <Medal className="w-4 h-4 text-slate-300" />
              <span>2° POSTO · ARGENTO</span>
            </div>
            <div
              onClick={() => onInspect(topThree[1])}
              className="w-full h-36 bg-black/60 border border-slate-600 p-1 mb-2 flex items-center justify-center cursor-pointer relative group"
            >
              <img
                src={topThree[1].url}
                alt={topThree[1].name}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Eye className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="font-vt text-lg text-slate-200 truncate w-full">{topThree[1].name}</div>
            <div className="font-pixel text-xs text-amber-300 mt-1 tabular-nums">ELO {topThree[1].elo}</div>
            <div className="text-[11px] font-mono text-slate-400">{topThree[1].wins}V - {topThree[1].losses}S</div>
          </div>

          {/* #1 Gold (Center, Elevated) */}
          <div className="rpg-window-gold p-4 order-1 md:order-2 flex flex-col items-center text-center ring-2 ring-amber-400 shadow-2xl scale-[1.03]">
            <div className="flex items-center gap-1 text-amber-400 font-pixel text-xs mb-2">
              <Crown className="w-5 h-5 text-amber-400 animate-bounce" />
              <span className="font-bold">1° CAMPIONE ASSOLUTO</span>
            </div>
            <div
              onClick={() => onInspect(topThree[0])}
              className="w-full h-44 bg-black/60 border-2 border-amber-400 p-1 mb-2 flex items-center justify-center cursor-pointer relative group"
            >
              <img
                src={topThree[0].url}
                alt={topThree[0].name}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Eye className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="font-vt text-xl text-amber-300 font-bold truncate w-full">{topThree[0].name}</div>
            <div className="font-pixel text-sm text-amber-400 mt-1 tabular-nums">ELO {topThree[0].elo}</div>
            <div className="text-xs font-mono text-emerald-400 font-bold">
              {topThree[0].wins}V - {topThree[0].losses}S ({topThree[0].matches > 0 ? Math.round((topThree[0].wins / topThree[0].matches) * 100) : 0}%)
            </div>
          </div>

          {/* #3 Bronze (Right) */}
          <div className="rpg-window p-3 order-3 md:order-3 flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-amber-700 font-pixel text-xs mb-2">
              <Medal className="w-4 h-4 text-amber-600" />
              <span>3° POSTO · BRONZO</span>
            </div>
            <div
              onClick={() => onInspect(topThree[2])}
              className="w-full h-36 bg-black/60 border border-amber-900 p-1 mb-2 flex items-center justify-center cursor-pointer relative group"
            >
              <img
                src={topThree[2].url}
                alt={topThree[2].name}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Eye className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="font-vt text-lg text-slate-200 truncate w-full">{topThree[2].name}</div>
            <div className="font-pixel text-xs text-amber-300 mt-1 tabular-nums">ELO {topThree[2].elo}</div>
            <div className="text-[11px] font-mono text-slate-400">{topThree[2].wins}V - {topThree[2].losses}S</div>
          </div>
        </div>
      )}

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 border-2 border-blue-950 font-mono text-xs">
        <div className="w-full sm:w-72 flex items-center gap-2 bg-slate-950 border border-slate-700 px-2 py-1.5 focus-within:border-amber-400">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca per nome file..."
            className="w-full bg-transparent text-white outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> ORDINA PER:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'elo' | 'wins' | 'matches' | 'winrate')}
            className="bg-slate-950 border border-slate-700 text-slate-200 px-2 py-1 rounded-xs outline-hidden cursor-pointer"
          >
            <option value="elo">Punteggio Elo (Decrescente)</option>
            <option value="wins">Maggior Numero di Vittorie</option>
            <option value="winrate">Percentuale di Vittorie (%)</option>
            <option value="matches">Più Duelli Disputati</option>
          </select>
        </div>
      </div>

      {/* Main Table / Grid of Ranked Images */}
      <div className="rpg-window p-2 sm:p-4 overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b-2 border-blue-900 text-slate-400 font-pixel text-[10px] pb-2">
              <th className="py-2.5 px-3">POS.</th>
              <th className="py-2.5 px-3">ANTEPRIMA</th>
              <th className="py-2.5 px-3">NOME IMMAGINE</th>
              <th className="py-2.5 px-3 text-center">RANGO</th>
              <th className="py-2.5 px-3 text-right">ELO</th>
              <th className="py-2.5 px-3 text-center">W - L - D</th>
              <th className="py-2.5 px-3 text-right">WIN RATE</th>
              <th className="py-2.5 px-3 text-center">AZIONI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredItems.map((item, index) => {
              const tier = getRankTier(item.elo);
              const lvl = getRpgLevel(item.elo);
              const winRate = item.matches > 0 ? Math.round((item.wins / item.matches) * 100) : 0;
              const isFirst = index === 0 && !searchTerm && sortBy === 'elo';

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-blue-950/40 transition-colors ${
                    isFirst ? 'bg-amber-400/5 font-bold' : ''
                  }`}
                >
                  {/* Position */}
                  <td className="py-2.5 px-3 font-pixel text-xs">
                    {index === 0 ? (
                      <span className="text-amber-400">#1 👑</span>
                    ) : index === 1 ? (
                      <span className="text-slate-300">#2 🥈</span>
                    ) : index === 2 ? (
                      <span className="text-amber-600">#3 🥉</span>
                    ) : (
                      <span className="text-slate-500">#{index + 1}</span>
                    )}
                  </td>

                  {/* Thumbnail */}
                  <td className="py-2 px-3">
                    <button
                      onClick={() => onInspect(item)}
                      className="w-12 h-12 bg-black border border-slate-700 p-0.5 rounded-xs flex items-center justify-center cursor-pointer hover:border-amber-400 transition-colors"
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain"
                      />
                    </button>
                  </td>

                  {/* Name */}
                  <td className="py-2.5 px-3">
                    <div className="font-vt text-base text-slate-100 truncate max-w-xs sm:max-w-sm">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      LVL {lvl} · {item.matches} duelli
                    </div>
                  </td>

                  {/* Rank Tier */}
                  <td className="py-2.5 px-3 text-center">
                    <span className={`font-pixel text-[9px] ${tier.color}`}>
                      {tier.title}
                    </span>
                  </td>

                  {/* Elo Score */}
                  <td className="py-2.5 px-3 text-right">
                    <span className="font-pixel text-xs text-amber-400 tabular-nums">
                      {item.elo}
                    </span>
                  </td>

                  {/* Record */}
                  <td className="py-2.5 px-3 text-center tabular-nums">
                    <span className="text-emerald-400">{item.wins}</span>
                    <span className="text-slate-500"> / </span>
                    <span className="text-red-400">{item.losses}</span>
                    <span className="text-slate-500"> / </span>
                    <span className="text-amber-400">{item.draws}</span>
                  </td>

                  {/* Win Rate */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="font-mono tabular-nums text-slate-200">{winRate}%</div>
                    <div className="w-16 h-1.5 bg-slate-800 border border-slate-700 rounded-xs overflow-hidden ml-auto mt-1">
                      <div
                        className="h-full bg-cyan-400"
                        style={{ width: `${winRate}%` }}
                      />
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onInspect(item)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xs pixel-btn cursor-pointer inline-flex items-center gap-1"
                      title="Ispeziona foto a tutto schermo"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="py-12 text-center text-slate-400 font-pixel text-xs">
            Nessuna immagine corrisponde alla ricerca.
          </div>
        )}
      </div>
    </div>
  );
};
