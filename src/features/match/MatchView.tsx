import { multiplayerAverage, practiceFeedback } from '../../game/stats';
import Dartboard from '../dartboard/Dartboard';
import type { MatchController } from '../match/useMatch';
import CurrentTurn from './CurrentTurn';
import MatchHeading from './MatchHeading';
import Scoreboard from './Scoreboard';
import TurnHistory from './TurnHistory';
export default function MatchView(props: MatchController & { onEndGame: () => void }) {
  const {
    match,
    state,
    games,
    confirmNew,
    setConfirmNew,
    setMatch,
    onEndGame,
    editingTurn,
    throwDart
  } = props;
  if (!match || !state) return null;
  return <>
    <MatchHeading {...props} />
    {(confirmNew || state.winner !== null) && <div className="notice" role="group" aria-label="End game options">
      {state.winner === null && <>
        End this game and clear the lineup, or play again with the same players?{' '}
        <button className="secondary" onClick={() => setConfirmNew(false)}>Cancel</button>{' '}
      </>}
      <button className="secondary" onClick={() => setMatch({ ...match, actions: [] }, true)}>Rematch</button>{' '}
      <button className="primary danger" onClick={onEndGame}>End game</button>
    </div>}
    {match.mode !== 'shanghai' && match.players.length === 1 && (() => {
      const baseline = multiplayerAverage(games.map(game => game.match), match.players[0]);
      return <p className="notice" role="status">{state.winner !== null ? practiceFeedback(match, games.map(game => game.match)) : baseline.average === null ? 'Finish a multiplayer match with this player name to compare your practice average.' : `Your multiplayer average: ${baseline.average.toFixed(1)} points per dart · ${(baseline.average * 3).toFixed(1)} per 3 darts · ${baseline.games} ${baseline.games === 1 ? 'match' : 'matches'}`}</p>;
    })()}{state.finalRound && <p className="notice" role="status">Final round: remaining players get their turn to check out and share the win.</p>}<Scoreboard {...props} />
    <div className="play-layout">
      <section className="panel board-panel">
        <div className="section-title">
          <h2>The board</h2>
          <span>Outer black area = miss</span>
        </div>
        <Dartboard disabled={editingTurn !== null || state.turn.status !== 'playing'} onThrow={throwDart} />
      </section>
      <CurrentTurn {...props} />
    </div>
    <TurnHistory {...props} />
  </>;
}
