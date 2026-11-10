import { useState } from 'react';
import { dartLabel, type Dart } from '../../game/scoring';
const options: Dart[] = [{
  number: 0,
  multiplier: 1
}, ...([1, 2, 3] as const).flatMap(multiplier => Array.from({
  length: 20
}, (_, i) => ({
  number: i + 1,
  multiplier
}))), {
  number: 25,
  multiplier: 1
}, {
  number: 25,
  multiplier: 2
}];
export default function TurnEditor({
  darts,
  onSave,
  onCancel
}: {
  darts: Dart[];
  onSave: (darts: Dart[]) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState(() => [0, 1, 2].map(i => darts[i] ? dartLabel(darts[i]) : ''));
  const [error, setError] = useState('');
  return <form className="turn-editor" onSubmit={e => {
    e.preventDefault();
    const firstEmpty = values.indexOf('');
    if (firstEmpty >= 0 && values.slice(firstEmpty).some(Boolean)) {
      setError('Keep thrown darts together; use Not thrown only after the last dart.');
      return;
    }
    try {
      onSave(values.filter(Boolean).map(value => options.find(dart => dartLabel(dart) === value)!));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save correction.');
    }
  }}>
    <div className="turn-editor-fields">{values.map((value, i) => <label key={i}>Dart {i + 1}<select value={value} onChange={e => setValues(values.map((old, j) => i === j ? e.target.value : old))}>
      <option value="">Not thrown</option>{options.map(dart => <option key={dartLabel(dart)} value={dartLabel(dart)}>{dartLabel(dart)}</option>)}</select>
    </label>)}</div>
    <p className="small muted">S = single · D = double · T = triple. Scores and averages recalculate after saving.</p>{error && <p className="notice" role="alert">{error}</p>}<div className="controls">
      <button className="primary">Save correction</button>
      <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
    </div>
  </form>;
}
