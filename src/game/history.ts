import { getState, type Match } from './scoring';
export type SavedGame = {
  id: string;
  finishedAt: string;
  match: Match;
};
export const historyKey = 'dart-web-history-v1';
export function loadHistory(): SavedGame[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(historyKey) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((game): game is SavedGame => {
      try {
        return typeof game.id === 'string' && typeof game.finishedAt === 'string' && getState(game.match).winner !== null;
      } catch {
        return false;
      }
    });
  } catch {
    return [];
  }
}
export function updateHistory(history: SavedGame[], match: Match, id: string): SavedGame[] {
  const existing = history.find(game => game.id === id);
  const rest = history.filter(game => game.id !== id);
  if (getState(match).winner === null) return rest;
  return [{
    id,
    finishedAt: existing?.finishedAt ?? new Date().toISOString(),
    match
  }, ...rest];
}
