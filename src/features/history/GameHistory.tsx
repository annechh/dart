import { Fragment, useState } from 'react';
import { gameModeLabels } from '../../game/gameModes';
import type { SavedGame } from '../../game/history';
import { getState } from '../../game/scoring';
import type { MatchController } from '../match/useMatch';
import { loadProfiles } from '../profiles/profileStorage';
import GameReview from './GameReview';
import HistoryPlayer from './HistoryPlayer';

const historyViews = [
  ...Object.entries(gameModeLabels),
  ['practice', 'Practice'],
];

export default function GameHistory({
  games,
  setShowGames,
}: Pick<MatchController, 'games' | 'setShowGames'>) {
  const [historyType, setHistoryType] = useState('301');
  const [review, setReview] = useState<SavedGame | null>(null);
  const profileImages = new Map(
    loadProfiles().map((profile) => [profile.name, profile.image]),
  );
  const views = historyViews.map(([type, label]) => ({
    type,
    label,
    games: games.filter(
      ({ match }) =>
        type ===
        (match.players.length === 1 ? 'practice' : (match.mode ?? '301')),
    ),
  }));
  const visibleGames =
    views.find((view) => view.type === historyType)?.games ?? [];

  return (
    <section className="panel history-panel">
      <div className="section-title">
        <h2>Game history</h2>
        <button className="text-button" onClick={() => setShowGames(false)}>
          Close history ×
        </button>
      </div>
      <div className="history-tabs" role="group" aria-label="History view">
        {views.map(({ type, label, games: viewGames }) => (
          <button
            key={type}
            className={historyType === type ? 'primary' : 'secondary'}
            aria-pressed={historyType === type}
            onClick={() => {
              setHistoryType(type);
              setReview(null);
            }}
          >
            {label} ({viewGames.length})
          </button>
        ))}
      </div>
      <p className="muted small">
        {historyType === 'practice'
          ? 'Solo practice games.'
          : 'Games with two or more players.'}{' '}
        Saved in this browser on this device.
      </p>
      {visibleGames.length ? (
        visibleGames.map((game) => {
          const result = getState(game.match);
          const mode = game.match.mode ?? '301';
          const details =
            mode === 'shanghai'
              ? ` · ${game.match.shanghaiRounds ?? 7} rounds`
              : mode === '301'
                ? ` / ${game.match.outRule} out`
                : '';
          return (
            <article className="saved-game" key={game.id}>
              <div className="saved-game-info">
                <p>
                  <strong>
                    {result.winners
                      .map((i) => game.match.players[i])
                      .join(' & ')}{' '}
                    won
                  </strong>{' '}
                  · {gameModeLabels[mode]}
                  {details}
                </p>
                <p className="muted small history-player-list">
                  {game.match.players.map((name, index) => (
                    <Fragment key={index}>
                      {index > 0 && '  '}
                      <HistoryPlayer
                        name={name}
                        image={profileImages.get(name)}
                      />
                    </Fragment>
                  ))}
                </p>
                <span className="muted small">
                  {new Date(game.finishedAt).toLocaleString()}
                </span>
              </div>
              <button
                className="secondary"
                onClick={() => setReview(review?.id === game.id ? null : game)}
              >
                Review game
              </button>
            </article>
          );
        })
      ) : (
        <p className="muted empty-history">No games saved in this view yet.</p>
      )}
      {review && <GameReview review={review} profileImages={profileImages} />}
    </section>
  );
}
