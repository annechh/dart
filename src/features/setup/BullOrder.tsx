import { useState } from 'react';
export default function BullOrder({
  players,
  onStart
}: {
  players: string[];
  onStart: (players: string[]) => void;
}) {
  const [distances, setDistances] = useState<Record<number, {
    cm: string;
    mm: string;
  }>>({});
  const [groups, setGroups] = useState<number[][]>([players.map((_, i) => i)]);
  const pending = groups.find(group => group.length > 1) ?? [];
  const [message, setMessage] = useState('Closest to the centre throws first. Measure each dart manually.');
  return <section className="panel bull-order">
    <h2>Throw for bull</h2>
    <p className="muted small">{message} Blank fields count as 0. Enter whole centimetres and 0–9 millimetres (2 cm + 5 mm = 25 mm).</p>
    <form onSubmit={e => {
      e.preventDefault();
      const ranked = [...pending].sort((a, b) => Number(distances[a]?.cm ?? 0) * 10 + Number(distances[a]?.mm ?? 0) - Number(distances[b]?.cm ?? 0) * 10 - Number(distances[b]?.mm ?? 0));
      const distance = (i: number) => Number(distances[i]?.cm ?? 0) * 10 + Number(distances[i]?.mm ?? 0);
      const resolved: number[][] = [];
      for (const player of ranked) {
        const last = resolved.at(-1);
        if (last && distance(last[0]) === distance(player)) last.push(player); else resolved.push([player]);
      }
      const next = groups.flatMap(group => group === pending ? resolved : [group]);
      const tied = next.find(group => group.length > 1);
      if (!tied) {
        onStart(next.flat().map(i => players[i]));
        return;
      }
      setGroups(next);
      setDistances({});
      setMessage(`${tied.map(i => players[i]).join(' and ')} tied. Only these players throw again; other positions are saved.`);
    }}>
      {pending.map(i => <div className="bull-distance" key={i}>
        <strong>{players[i]}</strong>
        <label>cm<input type="number" min="0" step="1" placeholder="0" value={distances[i]?.cm ?? ''} onChange={e => setDistances({
          ...distances,
          [i]: {
            cm: e.target.value,
            mm: distances[i]?.mm ?? ''
          }
        })} />
        </label>
        <label>mm<input type="number" min="0" max="9" step="1" placeholder="0" value={distances[i]?.mm ?? ''} onChange={e => setDistances({
          ...distances,
          [i]: {
            cm: distances[i]?.cm ?? '',
            mm: e.target.value
          }
        })} />
        </label>
      </div>)}
      <button className="primary start-button">Confirm distances →</button>
    </form>
  </section>;
}
