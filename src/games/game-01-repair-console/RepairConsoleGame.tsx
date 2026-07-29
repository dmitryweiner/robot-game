import { useState } from 'react';
import { CommandReference, type ManPageEntry } from '../../components/CommandReference';
import { ManLinks } from '../../components/ManLinks';
import type { GameProps } from '../types';
import { HintButton } from './HintButton';
import { COMMAND_MAN_PAGES, OPERATOR_MAN_PAGES } from './manPages';
import { detectStageIndex, STAGES } from './objectives';
import { poseForProgress } from './pose';
import { RobotIllustration } from './RobotIllustration';
import { createInitialFs } from './shell/fs';
import type { ExecResult } from './shell/interpreter';
import type { ShellEvent } from './shell/types';
import { StoryIntro } from './StoryIntro';
import { Terminal } from './Terminal';
import './RepairConsoleGame.css';

const COMMAND_ENTRIES = Object.values(COMMAND_MAN_PAGES);

export function RepairConsoleGame({ onComplete }: GameProps) {
  const [fs] = useState(createInitialFs);
  const [stageIndex, setStageIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [manEntry, setManEntry] = useState<ManPageEntry | null>(null);

  function handleLine(line: string, result: ExecResult) {
    const detected = detectStageIndex(line, result);
    if (detected !== null) {
      setStageIndex((prev) => Math.min(STAGES.length - 1, Math.max(prev, detected + 1)));
    }
  }

  function handleEvent(event: ShellEvent) {
    if (event.type === 'script-success' && event.script === '/drivers/nb_init.sh') {
      setSolved(true);
    }
  }

  if (!introDismissed) {
    return <StoryIntro onStart={() => setIntroDismissed(true)} />;
  }

  return (
    <div className="repair-console-game">
      <aside className="repair-console-game__sidebar">
        <h2>Ремонтная консоль</h2>
        <RobotIllustration pose={poseForProgress(stageIndex, solved)} />
        {!solved ? (
          <>
            <p className="repair-console-game__hint">{STAGES[stageIndex].hint}</p>
            <HintButton key={STAGES[stageIndex].id} command={STAGES[stageIndex].command} />
          </>
        ) : (
          <div className="repair-console-game__solved">
            <p>Северный мост поднят. Робот снова чувствует свои руки и ноги.</p>
            <button onClick={onComplete}>Продолжить</button>
          </div>
        )}
        <ManLinks label="Команды:" entries={COMMAND_ENTRIES} onSelect={setManEntry} />
        <ManLinks label="Операторы:" entries={OPERATOR_MAN_PAGES} onSelect={setManEntry} />
      </aside>
      <div className="repair-console-game__terminal">
        <Terminal initialFs={fs} onEvent={handleEvent} onLine={handleLine} />
      </div>
      {manEntry && <CommandReference entry={manEntry} onClose={() => setManEntry(null)} />}
    </div>
  );
}
