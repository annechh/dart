import type { Dart } from '../../game/scoring';
import { useSpeechRecognition } from './useSpeechRecognition';
export default function VoiceInput({
  solo,
  paused,
  disabled,
  finished,
  onThrows,
  onSwitchPlayer
}: {
  solo: boolean;
  paused: boolean;
  disabled: boolean;
  finished: boolean;
  onThrows: (darts: Dart[]) => number;
  onSwitchPlayer: () => void;
}) {
  const {
    enabled,
    status,
    heard,
    micLog,
    logError,
    saveLog,
    exportLog,
    scoringActive,
    supported,
    toggleMicrophone
  } = useSpeechRecognition({
    solo,
    paused,
    disabled,
    finished,
    onThrows,
    onSwitchPlayer
  });
  return <section className="voice-input">
    <div className="section-title">
      <h2>Voice scoring</h2>
      <button className={enabled ? 'primary' : 'secondary'} disabled={!supported} aria-pressed={enabled} onClick={toggleMicrophone}>{enabled ? '● Mic on · turn off' : 'Enable microphone'}</button>
    </div>
    <p className="small">{enabled ? scoringActive ? 'Score entry active' : 'Waiting for add' : 'Microphone off'}</p>
    <p className="small" role="status">{!supported ? 'Speech recognition is unavailable in this browser. Try a supported desktop browser such as Chrome.' : paused && enabled ? 'Narrator speaking. Microphone paused.' : finished && enabled ? 'Match finished. Microphone paused.' : status}</p>{heard && <p className="muted small">Heard: “{heard}”</p>}<p className="muted small">Say “add twenty”, “add triple twenty”, “add single bull”, “add double bull”, or “add zero”. Conversation before the command is ignored: “oh no, add fifteen” records S15. You can combine darts: “add 20 plus 15 plus 3”, “add 20, add 15 plus 3”, or “add double twenty plus single bull”. Each number is a separate dart. Scoring stops when the turn ends, then waits for add again. You can also say add, pause, then say the target. Say {solo ? 'next round' : 'switch player'} to end the {solo ? 'round' : 'turn'}, including early. Use Undo to correct a score.</p>
    <details className="mic-log">
      <summary>Microphone log ({micLog.length})</summary>
      <p className="muted small">Latest 500 recognised phrases, including ignored speech. Saved in this browser; no audio recordings.</p>
      <div className="controls">
        <button className="secondary" disabled={!micLog.length} onClick={exportLog}>Export log</button>
        <button className="secondary" disabled={!micLog.length} onClick={() => {
          if (window.confirm('Clear the saved microphone log?')) saveLog([]);
        }}>Clear log</button>
      </div>{logError && <p role="alert" className="small">Could not save the log in this browser. Export it before leaving.</p>}<div className="mic-log-entries">{micLog.length ? micLog.map((entry, index) => <article key={`${entry.time}-${index}`}>
        <time>{new Date(entry.time).toLocaleString()}</time>
        <p>{entry.transcript}</p>
        <small>{entry.result}</small>
      </article>) : <p className="muted small">Enable the microphone and speak to begin logging.</p>}</div>
    </details>
    <p className="muted small">English voice commands. Your browser’s speech service may send audio online for recognition.</p>
  </section>;
}
