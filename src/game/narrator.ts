import { checkoutSuggestions, getState, type Match } from './scoring';
// Only forward transitions announce: throws, undo, and history review stay quiet.
export function startsNewTurn(previous: Match | null, next: Match | null): boolean {
  if (!next) return false;
  if (!previous) return next.actions.length === 0;
  return next.actions.length > previous.actions.length && next.actions.at(-1)?.type === 'end-turn';
}
export function checkoutAnnouncement(match: Match): string {
  if (match.mode === 'shanghai') return '';
  const {
    turn
  } = getState(match);
  if (turn.status !== 'playing') return '';
  const possible = checkoutSuggestions(turn.remaining, 3 - turn.darts.length, match.outRule, 1).length > 0;
  return possible ? `You have ${turn.remaining} remaining.` : '';
}
