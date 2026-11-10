import { getState, type Match } from './scoring';
export function playerStats(match: Match, player: number) {
  const state = getState(match);
  const turns = [...state.history, state.turn].filter(turn => turn.player === player);
  const darts = turns.reduce((sum, turn) => sum + turn.darts.length, 0);
  const scored = match.mode === 'shanghai' ? state.scores[player] : 301 - state.scores[player];
  return {
    darts,
    average: darts ? scored / darts : null,
    threeDartAverage: darts ? scored / darts * 3 : null
  };
}
export function turnAnnouncement(match: Match): string {
  const state = getState(match);
  return match.players.length === 1 ? `Round ${state.history.length + 1}.` : `${match.players[state.player]}, your turn.`;
}

// Weight each completed multiplayer game by darts thrown, including misses and busts.
export function multiplayerAverage(matches: Match[], name: string) {
  let darts = 0;
  let scored = 0;
  let games = 0;
  for (const match of matches) {
    if (match.mode === 'shanghai' || match.players.length < 2 || getState(match).winner === null) continue;
    const player = match.players.findIndex(player => player.trim().toLowerCase() === name.trim().toLowerCase());
    if (player < 0) continue;
    const stats = playerStats(match, player);
    if (!stats.darts) continue;
    darts += stats.darts;
    scored += 301 - getState(match).scores[player];
    games++;
  }
  return {
    average: darts ? scored / darts : null,
    games
  };
}
export function practiceFeedback(match: Match, history: Match[]): string {
  if (match.mode === 'shanghai') return 'Practice done. Good work!';
  const current = playerStats(match, 0).average;
  const baseline = multiplayerAverage(history, match.players[0]);
  if (current === null || baseline.average === null) return 'Practice done. Good work!';
  const difference = Number((current - baseline.average).toFixed(1));
  const comparison = difference === 0 ? 'level with' : `${Math.abs(difference).toFixed(1)} points per dart ${difference > 0 ? 'above' : 'below'}`;
  return `Practice done. Good work! You averaged ${current.toFixed(1)} points per dart, ${comparison} your multiplayer average of ${baseline.average.toFixed(1)}, across ${baseline.games} ${baseline.games === 1 ? 'match' : 'matches'}.`;
}
