import { useEffect, useRef, useState } from 'react';
import { historyKey, loadHistory, updateHistory } from '../../game/history';
import { checkoutAnnouncement, startsNewTurn } from '../../game/narrator';
import { checkoutSuggestions, endTurn, getState, points, recordThrow, turnScore, type Dart, type Match } from '../../game/scoring';
import { playDartSound } from '../../game/sounds';
import { practiceFeedback, turnAnnouncement } from '../../game/stats';
import { useAudioPreferences } from '../../hooks/useAudioPreferences';
import { useNarration } from '../voice/useNarration';
import { loadMatch, matchStorageKey } from './matchStorage';
export function useMatch() {
  const [match, updateMatch] = useState<Match | null>(loadMatch);
  const [gameId, setGameId] = useState(() => {
    try {
      return localStorage.getItem('dart-web-active-id') || crypto.randomUUID();
    } catch {
      return crypto.randomUUID();
    }
  });
  const [games, setGames] = useState(() => {
    const saved = loadHistory();
    if (!match || getState(match).winner === null) return saved;
    const next = updateHistory(saved, match, gameId);
    try {
      localStorage.setItem(historyKey, JSON.stringify(next));
      localStorage.setItem('dart-web-active-id', gameId);
    } catch {/* Keep results available in memory. */ }
    return next;
  });
  const [showGames, setShowGames] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [editingTurn, setEditingTurn] = useState<number | null>(null);
  const [confirmNew, setConfirmNew] = useState(false);
  const {
    sound,
    setSound,
    narrator,
    setNarrator
  } = useAudioPreferences();
  const {
    speaking,
    announce,
    cancelNarration
  } = useNarration(narrator);
  const nextTurnTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(nextTurnTimer.current), []);
  const liveMatch = useRef(match);
  const currentMatch = match;
  function setMatch(nextMatch: Match | null, rematch = false) {
    clearTimeout(nextTurnTimer.current);
    if (rematch || !nextMatch) {
      setConfirmNew(false);
      setEditingTurn(null);
      cancelNarration();
    }
    if (nextMatch && (rematch || startsNewTurn(currentMatch, nextMatch))) announce(`${turnAnnouncement(nextMatch)} ${checkoutAnnouncement(nextMatch)}`);
    const match = nextMatch;
    try {
      if (match) localStorage.setItem(matchStorageKey, JSON.stringify(match)); else localStorage.removeItem(matchStorageKey);
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
    try {
      const id = gameId;
      const nextId = match && match.actions.length === 0 && (rematch || !state || state.winner !== null) ? crypto.randomUUID() : id;
      if (match) {
        localStorage.setItem('dart-web-active-id', nextId);
        setGameId(nextId);
        const nextGames = updateHistory(games, match, nextId);
        localStorage.setItem(historyKey, JSON.stringify(nextGames));
        setGames(nextGames);
      }
    } catch {
      setSaveError(true);
    }
    liveMatch.current = match;
    updateMatch(match);
    const hasNewThrow = match && (!currentMatch || match.actions.length > currentMatch.actions.length) && match.actions.at(-1)?.type === 'throw';
    if (hasNewThrow && match) {
      const result = getState(match);
      const checkoutMessage = checkoutAnnouncement(match);
      if (checkoutMessage && currentMatch && getState(currentMatch).turn.remaining !== result.turn.remaining) announce(checkoutMessage);
      if (result.turn.status !== 'playing') {
        const total = turnScore(result.turn);
        const hitShanghai = match.mode === 'shanghai' && result.turn.status === 'won';
        const message = hitShanghai ? `Congratulations, ${match.players[result.player]}! You won by hitting Shanghai!` : result.turn.status === 'bust' ? 'Bust.' : `${total} points.${result.winner !== null ? ` ${match.players.length === 1 ? practiceFeedback(match, games.map(game => game.match)) : `${result.winners.map(i => match.players[i]).join(' and ')} ${result.winners.length > 1 ? 'share the win!' : 'wins!'}`}` : ''}`;
        if (result.winner === null) {
          const advance = () => {
            if (liveMatch.current !== match) return;
            setMatch(endTurn(match));
          };
          // Advance even when speech is muted, unsupported, or fails to finish.
          nextTurnTimer.current = setTimeout(advance, narrator && 'speechSynthesis' in window ? 6000 : 900);
          announce(message, advance);
        } else announce(message);
      }
    }
  }
  const state = match ? getState(match) : null;
  const checkoutOptions = state && match && match.mode !== 'shanghai' && state.turn.status === 'playing' ? checkoutSuggestions(state.turn.remaining, 3 - state.turn.darts.length, match.outRule) : [];
  const throwDart = (dart: Dart) => {
    if (!match || editingTurn !== null) return;
    const next = recordThrow(match, dart);
    setMatch(next);
    if (sound) {
      if (getState(next).turn.status !== 'bust') playDartSound(points(dart) > 0);
    }
  };
  function throwDarts(darts: Dart[]): number {
    if (!match) return 0;
    let next = match;
    let count = 0;
    for (const dart of darts) {
      const result = getState(next);
      if (result.winner !== null || result.turn.status !== 'playing') break;
      next = recordThrow(next, dart);
      count++;
    }
    if (count) {
      setMatch(next);
      if (sound && getState(next).turn.status !== 'bust') playDartSound(points(darts[count - 1]) > 0);
    }
    return count;
  }
  return {
    match,
    state,
    games,
    setMatch,
    saveError,
    sound,
    setSound,
    narrator,
    setNarrator,
    showGames,
    setShowGames,
    speaking,
    editingTurn,
    setEditingTurn,
    confirmNew,
    setConfirmNew,
    checkoutOptions,
    throwDart,
    throwDarts,
    nextTurnTimer,
    cancelNarration
  };
}
export type MatchController = ReturnType<typeof useMatch>;
