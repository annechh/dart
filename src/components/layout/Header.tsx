import type { MatchController } from '../../features/match/useMatch';
export default function Header({
  sound,
  setSound,
  narrator,
  setNarrator,
  cancelNarration,
  showGames,
  setShowGames,
  // onNewGame
}: Pick<
  MatchController,
  | 'sound'
  | 'setSound'
  | 'narrator'
  | 'setNarrator'
  | 'cancelNarration'
  | 'showGames'
  | 'setShowGames'
> & { onNewGame: () => void }) {
  return (
    <header className="topbar">
      <a className="brand" href="./">
        <span className="brand-wordmark">Dart</span>
        <span>Mates</span>
      </a>
      <nav className="header-actions" aria-label="Game controls">
        {/* <button className="new-game" onClick={onNewGame}>New game</button> */}
        <button
          className="secondary"
          aria-pressed={sound}
          onClick={() => {
            const next = !sound;
            setSound(next);
            try {
              localStorage.setItem('dart-web-sounds', next ? 'on' : 'off');
            } catch {
              /* Preference remains in memory. */
            }
          }}
        >
          Sound {sound ? 'on' : 'off'}
        </button>
        <button
          className="secondary"
          disabled={!('speechSynthesis' in window)}
          aria-pressed={narrator}
          onClick={() => {
            const next = !narrator;
            setNarrator(next);
            if (!next) cancelNarration();
            try {
              localStorage.setItem('dart-web-narrator', next ? 'on' : 'off');
            } catch {
              /* Preference remains in memory. */
            }
          }}
        >
          Narrator {narrator ? 'on' : 'off'}
        </button>
        <button
          className="secondary"
          aria-expanded={showGames}
          onClick={() => {
            setShowGames(!showGames);
          }}
        >
          Game history
        </button>
      </nav>
    </header>
  );
}
