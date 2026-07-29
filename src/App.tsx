import { useMemo, useState } from 'react';
import './App.css';
import { GlobalIntro } from './components/GlobalIntro';
import { Hub } from './components/Hub';
import { GAMES } from './games/registry';
import { loadProgress, markGameCompleted, markIntroSeen, type Progress } from './progress/progress';
import { useHashRoute } from './routing/useHashRoute';

export function App() {
  const [route, navigate] = useHashRoute();
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [introOpen, setIntroOpen] = useState<boolean>(() => !loadProgress().introSeen);

  const game = useMemo(
    () => (route.screen === 'game' ? GAMES.find((g) => g.id === route.gameId) : undefined),
    [route],
  );

  function closeIntro() {
    setIntroOpen(false);
    setProgress(markIntroSeen());
  }

  const screen =
    route.screen === 'game' && game ? (
      <div className="app">
        <header className="app__header">
          <button className="app__back" onClick={() => navigate({ screen: 'hub' })}>
            ← В меню
          </button>
        </header>
        <game.Component
          onComplete={() => {
            setProgress(markGameCompleted(game.id));
            navigate({ screen: 'hub' });
          }}
        />
      </div>
    ) : (
      <div className="app">
        <Hub
          games={GAMES}
          progress={progress}
          onSelectGame={(gameId) => navigate({ screen: 'game', gameId })}
          onOpenIntro={() => setIntroOpen(true)}
        />
      </div>
    );

  return (
    <>
      {screen}
      {introOpen && <GlobalIntro onClose={closeIntro} />}
    </>
  );
}
