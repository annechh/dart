export type ShanghaiRounds = 7 | 20;
export type GameMode = '301' | 'shanghai';
export type OutRule = 'single' | 'double';
export type Dart = {
  number: number;
  multiplier: 1 | 2 | 3;
};
export type Action = {
  type: 'throw';
  dart: Dart;
} | {
  type: 'end-turn';
};
export type Match = {
  players: string[];
  outRule: OutRule;
  mode?: GameMode;
  shanghaiRounds?: ShanghaiRounds;
  actions: Action[];
  fairEnding?: boolean;
};
export type Turn = {
  player: number;
  darts: Dart[];
  start: number;
  target?: number;
  remaining: number;
  status: 'playing' | 'complete' | 'bust' | 'won';
};
export type State = {
  scores: number[];
  player: number;
  turn: Turn;
  history: Turn[];
  winner: number | null;
  winners: number[];
  finalRound: boolean;
};
export function points(dart: Dart): number {
  const {
    number,
    multiplier
  } = dart;
  if (!Number.isInteger(number) || ![1, 2, 3].includes(multiplier) || !(number >= 0 && number <= 20 || number === 25) || number === 25 && multiplier === 3 || number === 0 && multiplier !== 1) {
    throw new Error('Invalid dart');
  }
  return number * multiplier;
}
export function createMatch(players: string[], outRule: OutRule = 'double', fairEnding = false, mode: GameMode = '301', shanghaiRounds: ShanghaiRounds = 7): Match {
  if (!players.length || players.some(name => !name.trim())) throw new Error('Enter at least one player name');
  return {
    players: players.map(name => name.trim()),
    outRule,
    fairEnding,
    ...(mode === 'shanghai' ? { mode, shanghaiRounds } : {}),
    actions: []
  };
}

// Replay recorded actions so undo restores the whole state, including busts and wins.
export function getState(match: Match): State {
  const shanghai = match.mode === 'shanghai';
  const scores: number[] = match.players.map(() => shanghai ? 0 : 301);
  let player = 0;
  let winner: number | null = null;
  const history: Turn[] = [];
  const winners: number[] = [];
  const fair = !shanghai && match.fairEnding && scores.length > 1;
  const finishRound = () => {
    if (winners.length && player === scores.length - 1) winner = winners[0];
  };
  const finishShanghai = () => {
    if (turn.target !== (match.shanghaiRounds ?? 7) || player !== scores.length - 1) return;
    const highest = Math.max(...scores);
    scores.forEach((score, index) => {
      if (score === highest) winners.push(index);
    });
    winner = winners[0];
    turn.status = 'complete';
  };
  const newTurn = (): Turn => ({
    player,
    darts: [],
    ...(shanghai ? { target: Math.floor(history.length / scores.length) + 1 } : {}),
    start: scores[player],
    remaining: scores[player],
    status: 'playing'
  });
  let turn = newTurn();
  for (const action of match.actions) {
    if (winner !== null) throw new Error('Match is finished');
    if (action.type === 'end-turn') {
      if (shanghai) finishShanghai();
      if (fair) finishRound();
      if (winner !== null) continue;
      history.push({
        ...turn,
        status: turn.status === 'playing' ? 'complete' : turn.status
      });
      player = (player + 1) % scores.length;
      turn = newTurn();
      continue;
    }
    if (turn.status !== 'playing') throw new Error('End this turn before throwing again');
    const value = points(action.dart);
    turn.darts.push(action.dart);
    if (turn.target !== undefined) {
      if (action.dart.number === turn.target) scores[player] += value;
      turn.remaining = scores[player];
      if (turn.darts.length === 3) {
        const hits = turn.darts.filter(dart => dart.number === turn.target);
        if (new Set(hits.map(dart => dart.multiplier)).size === 3) {
          turn.status = 'won';
          winners.push(player);
          winner = player;
        } else {
          turn.status = 'complete';
          finishShanghai();
        }
      }
      continue;
    }
    const remaining = turn.remaining - value;
    const doubleOut = match.outRule === 'double';
    if (remaining < 0 || doubleOut && (remaining === 1 || remaining === 0 && action.dart.multiplier !== 2)) {
      turn.status = 'bust';
      turn.remaining = turn.start;
      scores[player] = turn.start;
    } else {
      turn.remaining = remaining;
      scores[player] = remaining;
      if (remaining === 0) {
        turn.status = 'won';
        winners.push(player);
        if (!fair) winner = player;
      } else if (turn.darts.length === 3) turn.status = 'complete';
    }
    if (fair && turn.status !== 'playing') finishRound();
  }
  return {
    scores,
    player,
    turn,
    history,
    winner,
    winners,
    finalRound: winners.length > 0 && winner === null
  };
}
export function turnScore(turn: Turn): number {
  return turn.target === undefined ? turn.start - turn.remaining : turn.remaining - turn.start;
}
export function recordThrow(match: Match, dart: Dart): Match {
  points(dart);
  const next: Match = {
    ...match,
    actions: [...match.actions, {
      type: 'throw',
      dart
    }]
  };
  getState(next);
  return next;
}
export function endTurn(match: Match): Match {
  const next: Match = {
    ...match,
    actions: [...match.actions, {
      type: 'end-turn'
    }]
  };
  getState(next);
  return next;
}
export function undoThrow(match: Match): Match {
  let index = match.actions.length - 1;
  while (index >= 0 && match.actions[index].type !== 'throw') index--;
  return index < 0 ? match : {
    ...match,
    actions: match.actions.slice(0, index)
  };
}
export function dartLabel(dart: Dart): string {
  return dart.number === 0 ? 'Miss' : `${['', 'S', 'D', 'T'][dart.multiplier]}${dart.number}`;
}
const targets: Dart[] = [...Array.from({
  length: 20
}, (_, i) => ({
  number: 20 - i,
  multiplier: 3 as const
})), ...Array.from({
  length: 20
}, (_, i) => ({
  number: 20 - i,
  multiplier: 2 as const
})), {
  number: 25,
  multiplier: 2
}, ...Array.from({
  length: 20
}, (_, i) => ({
  number: 20 - i,
  multiplier: 1 as const
})), {
  number: 25,
  multiplier: 1
}];

// Prefer fewer darts; rank equal-length checkoutOptions by their target order above.
export function checkoutSuggestions(score: number, dartsLeft: number, outRule: OutRule, limit = 3): Dart[][] {
  if (!Number.isInteger(score) || score <= 0 || dartsLeft < 1 || dartsLeft > 3 || limit <= 0) return [];
  const checkoutOptions: Dart[][] = [];
  const finishTargets = outRule === 'single' ? [...targets.filter(dart => dart.multiplier === 1), ...targets.filter(dart => dart.multiplier !== 1)] : targets;
  function search(remaining: number, count: number, route: Dart[]) {
    if (checkoutOptions.length >= limit) return;
    for (const dart of count === 1 ? finishTargets : targets) {
      const next = remaining - points(dart);
      if (count === 1) {
        if (next === 0 && (outRule === 'single' || dart.multiplier === 2)) checkoutOptions.push([...route, dart]);
      } else if (next > (outRule === 'double' ? 1 : 0) && next <= (count - 1) * 60) {
        search(next, count - 1, [...route, dart]);
      }
      if (checkoutOptions.length >= limit) return;
    }
  }
  for (let count = 1; count <= dartsLeft && checkoutOptions.length < limit; count++) search(score, count, []);
  return checkoutOptions;
}
export function editTurn(match: Match, turnIndex: number, darts: Dart[]): Match {
  if (!Number.isInteger(turnIndex) || turnIndex < 0 || turnIndex >= getState(match).history.length || darts.length > 3) throw new Error('Invalid turn');
  darts.forEach(points);
  let turn = 0;
  let start = 0;
  for (let index = 0; index < match.actions.length; index++) {
    if (match.actions[index].type !== 'end-turn') continue;
    if (turn === turnIndex) {
      const next: Match = {
        ...match,
        actions: [...match.actions.slice(0, start), ...darts.map(dart => ({
          type: 'throw' as const,
          dart
        })), ...match.actions.slice(index)]
      };
      try {
        getState(next);
      } catch {
        throw new Error('This correction makes later darts invalid (for example, a checkout or bust occurs earlier). Later turns have been kept unchanged. Adjust the correction or undo those darts first.');
      }
      return next;
    }
    turn++;
    start = index + 1;
  }
  throw new Error('Turn not found');
}
