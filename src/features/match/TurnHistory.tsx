import { dartLabel, editTurn, turnScore } from '../../game/scoring';
import TurnEditor from '../match/TurnEditor';
import type { MatchController } from '../match/useMatch';
export default function TurnHistory({
  match,
  state,
  editingTurn,
  setEditingTurn,
  setMatch,
  nextTurnTimer,
  cancelNarration
}: Pick<MatchController, 'match' | 'state' | 'editingTurn' | 'setEditingTurn' | 'setMatch' | 'nextTurnTimer' | 'cancelNarration'>) {
  if (!match || !state) return null;
  return <section className="panel history-panel">
    <div className="section-title">
      <h2>Turn history</h2>
      <span>{state.history.length} completed turns</span>
    </div>{state.history.length ? <div className="history-scroll">
      <table>
        <thead>
          <tr>
            <th>Turn</th>
            <th>Player</th>
            <th>Darts</th>
            <th>Scored</th>
            <th>{match.mode === 'shanghai' ? 'Total' : 'Remaining'}</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{state.history.map((turn, i) => <tr key={i}>
          <td>{i + 1}</td>
          <td>{match.players[turn.player]}</td>{editingTurn === i ? <td colSpan={4}>
            <TurnEditor key={i} darts={turn.darts} onCancel={() => setEditingTurn(null)} onSave={darts => {
              const corrected = editTurn(match, i, darts);
              setMatch(corrected);
              setEditingTurn(null);
            }} />
          </td> : <>
            <td>{turn.darts.map(dartLabel).join(' · ') || 'Skipped'}</td>
            <td>{turn.status === 'bust' ? 'Bust' : turnScore(turn)}</td>
            <td>{turn.remaining}</td>
            <td>
              <button className="secondary" disabled={editingTurn !== null} onClick={() => {
                clearTimeout(nextTurnTimer.current);
                cancelNarration();
                setEditingTurn(i);
              }}>Edit</button>
            </td>
          </>}</tr>)}</tbody>
      </table>
    </div> : <p className="muted small">Completed turns will appear here.</p>}</section>;
}
