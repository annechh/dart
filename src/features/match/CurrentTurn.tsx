import { endTurn, turnScore, undoThrow } from '../../game/scoring';
import type { MatchController } from '../match/useMatch';
import VoiceInput from '../voice/VoiceInput';
export default function CurrentTurn({
  match,
  state,
  speaking,
  editingTurn,
  throwDarts,
  setMatch,
  throwDart
}: Pick<MatchController, 'match' | 'state' | 'speaking' | 'editingTurn' | 'throwDarts' | 'setMatch' | 'throwDart'>) {
  if (!match || !state) return null;
  return <aside className="turn-column">
    <section className="panel">
      <div className="section-title">
        <h2>Current turn</h2>
        <span>{state.turn.darts.length} / 3 darts</span>
      </div>
      <VoiceInput solo={match.players.length === 1} paused={speaking || editingTurn !== null} disabled={state.turn.status !== 'playing'} finished={state.winner !== null} onThrows={throwDarts} onSwitchPlayer={() => setMatch(endTurn(match))} />
      <div className="turn-total">
        <span>Turn score</span>
        <strong>{turnScore(state.turn)}</strong>
      </div>
      <p className="status" aria-live="polite">{state.winner !== null && match.mode === 'shanghai' ? state.turn.status === 'won' ? 'Shanghai! Match complete.' : 'Match complete.' : state.turn.status === 'bust' ? 'Bust. Score restored to the start of this turn.' : state.turn.status === 'won' ? state.finalRound ? 'Checkout! Remaining players finish the round.' : 'Checkout! Match complete.' : state.turn.status === 'complete' ? match.players.length === 1 ? 'Three darts recorded. Next round starts automatically.' : 'Three darts recorded. Next player starts automatically.' : `${3 - state.turn.darts.length} darts remaining this turn.`}</p>
      <div className="controls">
        <button className="secondary" disabled={state.turn.status !== 'playing'} onClick={() => throwDart({
          number: 0,
          multiplier: 1
        })}>Miss / 0</button>
        <button className="secondary" disabled={!match.actions.some(a => a.type === 'throw')} onClick={() => setMatch(undoThrow(match))}>↶ Undo throw</button>
      </div>
      <button className="primary next-button" disabled={state.winner !== null} onClick={() => setMatch(endTurn(match))}>{match.players.length === 1 ? state.turn.status === 'playing' && state.turn.darts.length > 0 ? 'End round early →' : 'Next round →' : state.turn.status === 'playing' ? state.turn.darts.length ? 'End turn early →' : 'Skip player →' : 'Next player →'}</button>
    </section>
  </aside>;
}
