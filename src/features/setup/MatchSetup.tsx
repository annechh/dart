import { createMatch } from '../../game/scoring';
import type { MatchController } from '../match/useMatch';
import Profiles from '../profiles/Profiles';
import BullOrder from '../setup/BullOrder';
import PlayerLineup from '../setup/PlayerLineup';
import type { MatchSetupState } from './useMatchSetup';
export default function MatchSetup({
  setMatch,
  names,
  setNames,
  bull,
  setBull,
  bullSetup,
  setBullSetup,
  fairEnding,
  setFairEnding,
  shanghaiRounds,
  setShanghaiRounds,
  mode,
  setMode,
  rule,
  setRule
}: Pick<MatchController, 'setMatch'> & MatchSetupState) {
  return <section className={bullSetup ? 'setup' : 'setup setup-wide'}>
    <p className="eyebrow">LET’S PLAY</p>
    <h1>Every dart counts.</h1>
    <p className="muted">Choose a game and set up your match. One board, one device, your players.</p>
    {bullSetup ? <>
      <BullOrder players={names} onStart={players => {
        setMatch(createMatch(players, rule, fairEnding, mode, shanghaiRounds));
        setBullSetup(false);
      }} />
      <button className="text-button" onClick={() => setBullSetup(false)}>Back to setup</button>
    </> : <div className="setup-columns">
      <form className="panel setup-form" onSubmit={e => {
        e.preventDefault();
        if (bull && names.length > 1) setBullSetup(true); else setMatch(createMatch(names, rule, fairEnding, mode, shanghaiRounds));
      }}>
        <div className="section-title">
          <h2>Game mode</h2>
          <span>{names.length} players</span>
        </div>
        <PlayerLineup names={names} onRemove={name => setNames(names.filter(n => n !== name))} />
        <span className="field-label" id="game-label">GAME</span>
        <div className="finish-rule-buttons" role="group" aria-labelledby="game-label">{(['301', 'shanghai'] as const).map(option => <button key={option} type="button" className={mode === option ? 'primary' : 'secondary'} aria-pressed={mode === option} onClick={() => setMode(option)}>{option === '301' ? '301' : 'Shanghai'}</button>)}</div>
        {mode === 'shanghai' ? <>
          <span className="field-label" id="shanghai-rounds-label">ROUNDS</span>
          <div className="setup-choices" role="group" aria-labelledby="shanghai-rounds-label">
            {([7, 20] as const).map(rounds => <label key={rounds}>
              <span>{rounds} rounds</span>
              <input type="radio" name="shanghai-rounds" checked={shanghaiRounds === rounds} onChange={() => setShanghaiRounds(rounds)} />
              <span className="choice-track" aria-hidden="true"><span>✓</span></span>
            </label>)}
          </div>
          <p className="muted small">Play targets 1–{shanghaiRounds}. Highest score wins, or hit the single, double and triple of the target in one turn to win immediately.</p>
        </> : <>
        <span className="field-label" id="finish-rule-label">FINISH RULE</span>
        <div className="setup-choices" role="group" aria-labelledby="finish-rule-label">
          {(['single', 'double'] as const).map(option => <label key={option}>
            <span>{option === 'single' ? 'Single out' : 'Double out'}</span>
            <input type="radio" name="finish-rule" checked={rule === option} onChange={() => setRule(option)} />
            <span className="choice-track" aria-hidden="true"><span>✓</span></span>
          </label>)}
        </div>
        <p className="muted small">{rule === 'double' ? 'Finish on a double or the bull. Leaving 1 is a bust.' : 'Finish with any scoring segment, reaching exactly zero.'}</p>
        </>}
        <div className="match-options">{names.length > 1 && <>
          <label>
            <input type="checkbox" checked={bull} onChange={e => setBull(e.target.checked)} /> Throw for bull to decide playing order</label>
          {mode === '301' && <><label>
            <input type="checkbox" checked={fairEnding} onChange={e => setFairEnding(e.target.checked)} /> Fair ending — everyone finishes the round</label>
          <p className="muted small">Players who check out in the final round share the win.</p></>}
        </>}</div>
        <button className="primary start-button" disabled={!names.length || names.some(n => !n.trim())}>Start {mode === 'shanghai' ? 'Shanghai' : '301'} match →</button>
      </form>
      <Profiles names={names} onChange={setNames} />
    </div>}<p className="small muted">No account needed. Your current match saves in this browser.</p>
  </section>;
}
