import { useState } from 'react';
import { dartLabel, points, type Dart } from '../../game/scoring';
import { DARTBOARD_NUMBERS } from './constants';
import { position, segment } from './geometry';
export default function Dartboard({
  disabled,
  onThrow
}: {
  disabled: boolean;
  onThrow: (dart: Dart) => void;
}) {
  const [hover, setHover] = useState('Select a segment');
  return <div className="board-wrap">
    <svg viewBox="-18 -18 536 536" className={`board ${disabled ? 'board-disabled' : ''}`} aria-label="Dartboard scoring controls">
      <circle className="miss-zone" cx="250" cy="250" r="264" fill="#05080c" stroke="#40505e" strokeWidth="2" role="button" tabIndex={disabled ? -1 : 0} aria-label="Miss — 0 points" aria-disabled={disabled} onMouseEnter={() => setHover('Miss — 0 points')} onFocus={() => setHover('Miss — 0 points')} onClick={() => !disabled && onThrow({
        number: 0,
        multiplier: 1
      })} onKeyDown={e => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onThrow({
            number: 0,
            multiplier: 1
          });
        }
      }}>
        <title>Miss — 0 points</title>
      </circle>
      {DARTBOARD_NUMBERS.map((number, index) => <g key={number}>
        {([{
          inner: 34,
          outer: 115,
          multiplier: 1
        }, {
          inner: 115,
          outer: 138,
          multiplier: 3
        }, {
          inner: 138,
          outer: 190,
          multiplier: 1
        }, {
          inner: 190,
          outer: 214,
          multiplier: 2
        }] as const).map((ring, i) => {
          const dart: Dart = {
            number,
            multiplier: ring.multiplier
          };
          const label = `${dartLabel(dart)} — ${points(dart)} points`;
          return <path key={i} d={segment(ring.inner, ring.outer, index * 18)} fill={ring.multiplier === 1 ? index % 2 ? '#eadfc9' : '#25313a' : index % 2 === 0 ? '#c7524f' : '#288e77'} stroke="#a6aaa4" strokeWidth=".8" role="button" tabIndex={disabled ? -1 : 0} aria-label={label} aria-disabled={disabled} onMouseEnter={() => setHover(label)} onFocus={() => setHover(label)} onClick={() => !disabled && onThrow(dart)} onKeyDown={e => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onThrow(dart);
            }
          }}>
            <title>{label}</title>
          </path>;
        })}
        <text x={position(232, index * 18)[0]} y={position(232, index * 18)[1]} textAnchor="middle" dominantBaseline="central" fill="#f4f0e8" fontSize="18" fontWeight="600" pointerEvents="none">{number}</text>
      </g>)}
      {([{
        r: 34,
        multiplier: 1,
        fill: '#288e77'
      }, {
        r: 14,
        multiplier: 2,
        fill: '#c7524f'
      }] as const).map(bull => {
        const dart: Dart = {
          number: 25,
          multiplier: bull.multiplier
        };
        const label = `${bull.multiplier === 2 ? 'Bull' : 'Outer bull'} — ${points(dart)} points`;
        return <circle key={bull.r} cx="250" cy="250" r={bull.r} fill={bull.fill} stroke="#a6aaa4" role="button" tabIndex={disabled ? -1 : 0} aria-label={label} aria-disabled={disabled} onMouseEnter={() => setHover(label)} onFocus={() => setHover(label)} onClick={() => !disabled && onThrow(dart)} onKeyDown={e => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onThrow(dart);
          }
        }}>
          <title>{label}</title>
        </circle>;
      })}
    </svg>
    <div className="board-caption">{disabled ? 'Turn finished · use the controls to continue' : hover}</div>
  </div>;
}
