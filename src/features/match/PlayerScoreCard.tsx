import DartSlots from '../../components/darts/DartSlots';
import { playerStats } from '../../game/stats';
import CheckoutSuggestions from './CheckoutSuggestions';
import type { MatchController } from './useMatch';
export default function PlayerScoreCard({
  match,
  state,
  checkoutOptions,
  name,
  playerIndex
}: Pick<MatchController, 'match' | 'state' | 'checkoutOptions'> & {
  name: string;
  playerIndex: number;
}) {
  if (!match || !state) return null;
  return <article className={`score-card ${state.player === playerIndex ? 'active' : ''}`}>
    <div className="score-name">{name}<span>{state.winners.includes(playerIndex) ? state.winner === null ? 'CHECKED OUT' : 'WINNER' : state.player === playerIndex ? 'THROWING' : 'UP NEXT'}</span>
    </div>
    <div className="score-number">{state.scores[playerIndex]}</div>
    <span className="small muted">{state.turn.target === undefined ? 'remaining' : 'points'}</span>{(() => {
      const turn = state.player === playerIndex ? state.turn : state.history.findLast(turn => turn.player === playerIndex);
      return <section className="player-darts" aria-label={`${name} dart results`}>
        <p className="field-label">{state.player === playerIndex ? 'CURRENT TURN' : 'LAST TURN'}</p>
        <DartSlots turn={turn} />{turn?.status === 'bust' && <p className="small dart-bust">Bust · turn score restored</p>}</section>;
    })()}<div className="average-stats">
      <span>
        <strong>{playerStats(match, playerIndex).average?.toFixed(1) ?? '—'}</strong> avg / dart</span>
      <span>
        <strong>{playerStats(match, playerIndex).threeDartAverage?.toFixed(1) ?? '—'}</strong> 3-dart avg</span>
    </div>{state.winner !== null && <p className="darts-used">{state.history.filter(turn => turn.player === playerIndex).reduce((total, turn) => total + turn.darts.length, 0) + (state.turn.player === playerIndex ? state.turn.darts.length : 0)} darts thrown</p>}{state.turn.target === undefined && state.player === playerIndex && <CheckoutSuggestions checkoutOptions={checkoutOptions} state={state} />}</article>;
}
