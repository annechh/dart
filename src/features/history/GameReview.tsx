import type { SavedGame } from '../../game/history';
import { dartLabel, getState } from '../../game/scoring';
import HistoryPlayer from './HistoryPlayer';
export default function GameReview({
  review,
  profileImages
}: {
  review: SavedGame;
  profileImages: ReadonlyMap<string, string>;
}) {
  const result = getState(review.match);
  const turns = [...result.history, result.turn];
  return <div className="game-review">
    <h2>{result.winners.map(i => review.match.players[i]).join(' & ')} wins · {new Date(review.finishedAt).toLocaleString()}</h2>
    <div className="history-scroll">
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Remaining</th>
            <th>Darts thrown</th>
          </tr>
        </thead>
        <tbody>{review.match.players.map((name, i) => <tr key={i}>
          <td><HistoryPlayer name={name} image={profileImages.get(name)} />{result.winners.includes(i) ? ' · Winner' : ''}</td>
          <td>{result.scores[i]}</td>
          <td>{turns.filter(t => t.player === i).reduce((sum, t) => sum + t.darts.length, 0)}</td>
        </tr>)}</tbody>
      </table>
      <h2>All turns</h2>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Darts</th>
            <th>Remaining</th>
          </tr>
        </thead>
        <tbody>{turns.map((turn, i) => <tr key={i}>
          <td><HistoryPlayer name={review.match.players[turn.player]} image={profileImages.get(review.match.players[turn.player])} /></td>
          <td>{turn.darts.map(dartLabel).join(' · ') || 'Skipped'}{turn.status === 'bust' ? ' · Bust' : ''}</td>
          <td>{turn.remaining}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}
