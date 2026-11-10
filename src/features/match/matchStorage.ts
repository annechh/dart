import { getState, type Match } from '../../game/scoring';
export const matchStorageKey = 'dart-web-match-v1';
export function loadMatch(): Match | null {
  try {
    const raw = localStorage.getItem(matchStorageKey);
    if (!raw) return null;
    const match = JSON.parse(raw) as Match;
    if (!Array.isArray(match.players) || !match.players.length || !['single', 'double'].includes(match.outRule)) return null;
    getState(match);
    return match;
  } catch {
    return null;
  }
}
