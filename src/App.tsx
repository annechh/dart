import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import GameHistory from './features/history/GameHistory';
import MatchView from './features/match/MatchView';
import { useMatch } from './features/match/useMatch';
import MatchSetup from './features/setup/MatchSetup';
import { useMatchSetup } from './features/setup/useMatchSetup';
import { unlockSounds } from './game/sounds';
export default function App() {
  const controller = useMatch();
  const setup = useMatchSetup();
  function endGame() {
    setup.setNames([]);
    controller.setMatch(null);
  }

  return <main className="app-shell" onPointerDownCapture={unlockSounds} onKeyDownCapture={unlockSounds}>
    <Header {...controller} onNewGame={() => {
      if (controller.match && !window.confirm('End this match and start a new game?')) return;
      if (controller.match) endGame();
      controller.setShowGames(false);
    }} />
    {controller.saveError && <p role="alert" className="notice">Browser saving is unavailable. Keep this page open to preserve your match.</p>}
    {controller.showGames && <GameHistory {...controller} />}
    {controller.match && controller.state ? <MatchView {...controller} onEndGame={endGame} /> : <MatchSetup {...setup} setMatch={controller.setMatch} />}
    <Footer />
  </main>;
}
