import type { MatchController } from '../match/useMatch';
import PlayerScoreCard from './PlayerScoreCard';
export default function Scoreboard({
  match,
  state,
  checkoutOptions
}: Pick<MatchController, 'match' | 'state' | 'checkoutOptions'>) {
  if (!match || !state) return null;
  return <section className="scoreboard" aria-label="Player scores">{match.players.map((name, i) => <PlayerScoreCard key={i} name={name} playerIndex={i} match={match} state={state} checkoutOptions={checkoutOptions} />)}</section>;
}
