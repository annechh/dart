import { dartLabel, points, type getState } from '../../game/scoring';
type Turn = ReturnType<typeof getState>['turn'];
export default function DartSlots({
  turn
}: {
  turn?: Turn;
}) {
  return <div className="dart-slots">{[0, 1, 2].map(slot => {
    const dart = turn?.darts[slot];
    return <div key={slot} className={dart ? 'filled' : ''}>
      <span>DART {slot + 1}</span>
      <strong>{dart ? dartLabel(dart) : '—'}</strong>
      <small>{dart ? `${turn?.target === undefined || dart.number === turn.target ? points(dart) : 0} pts` : turn && turn.status !== 'playing' ? 'Not thrown' : 'Waiting'}</small>
    </div>;
  })}</div>;
}
