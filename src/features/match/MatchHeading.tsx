import type { MatchController } from '../match/useMatch';
export default function MatchHeading({
  match,
  state,
  setConfirmNew
}: Pick<MatchController, 'match' | 'state' | 'setConfirmNew'>) {
  if (!match || !state) return null;
  return <div className="match-heading">
    <div>
      <p className="eyebrow">{state.turn.target === undefined ? `301 / ${match.outRule.toUpperCase()} OUT` : `SHANGHAI / TARGET ${state.turn.target} OF ${match.shanghaiRounds ?? 7}`}</p>
      <h1>{state.winner !== null ? match.players.length === 1 ? 'Practice done. Good work!' : `${state.winners.map(i => match.players[i]).join(' & ')} ${state.winners.length > 1 ? 'share the win!' : 'wins!'}` : match.players.length === 1 ? `Practice · Round ${state.history.length + 1}` : `${match.players[state.player]} to throw`}</h1>
    </div>
    {state.winner === null && <button className="secondary danger" onClick={() => setConfirmNew(true)}>End game</button>}
  </div>;
}
