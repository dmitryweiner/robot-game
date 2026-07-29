import type { GameDescriptor } from '../games/types';
import { isGameCompleted, isGameUnlocked, type Progress } from '../progress/progress';
import './Hub.css';

interface HubProps {
  games: GameDescriptor[];
  progress: Progress;
  onSelectGame: (gameId: string) => void;
  onOpenIntro: () => void;
}

export function Hub({ games, progress, onSelectGame, onOpenIntro }: HubProps) {
  const order = games.map((game) => game.id);

  return (
    <div className="hub">
      <h1 className="hub__title">Помоги роботу</h1>
      <p className="hub__subtitle">Выбери главу, чтобы начать</p>
      <button className="hub__intro-button" onClick={onOpenIntro}>
        Введение
      </button>
      <ul className="hub__list">
        {games.map((game) => {
          const unlocked = isGameUnlocked(game.id, order, progress);
          const completed = isGameCompleted(game.id, progress);
          return (
            <li key={game.id} className="hub__item">
              <button
                className="hub__button"
                onClick={() => onSelectGame(game.id)}
                disabled={!unlocked}
                aria-label={`Глава ${game.chapterNumber}: ${game.title}`}
              >
                <span className="hub__chapter">{String(game.chapterNumber).padStart(2, '0')}</span>
                <span className="hub__name">{game.title}</span>
                <span className="hub__status">{completed ? '✓' : unlocked ? '' : '🔒'}</span>
              </button>
              <p className="hub__description">{game.shortDescription}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
