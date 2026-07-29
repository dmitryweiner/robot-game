import { useState } from 'react';
import { CommandReference, type ManPageEntry } from '../../components/CommandReference';
import { ConsolePane, type ConsoleLine } from '../../components/ConsolePane';
import { HintButton } from '../../components/HintButton';
import { ManLinks } from '../../components/ManLinks';
import type { GameProps } from '../types';
import { ControllerIllustration } from './ControllerIllustration';
import { DEFAULT_THRESHOLD, parseThreshold, renderFirmwareSource, shouldWater } from './firmware';
import { COMMAND_MAN_PAGES } from './manPages';
import { poseForProgress } from './pose';
import { runReplLine } from './repl';
import { STAGES } from './stages';
import { runBuildCommand, type CompiledArtifact } from './terminal';
import { StoryIntro } from './StoryIntro';
import './GreenhouseFirmwareGame.css';

// The greenhouse's actual readout at the moment the firmware comes back —
// the same numbers the chapter itself ends on. shouldWater(36, 21, 300, t)
// is true exactly when t > 36, so any threshold the player picks above that
// (40, as in the book, or anything else) genuinely fixes the greenhouse.
const SENSOR_MOISTURE = 36;
const SENSOR_AIR_TEMP = 21;
const SENSOR_SUN = 300;

const COMMAND_ENTRIES = Object.values(COMMAND_MAN_PAGES);

export function GreenhouseFirmwareGame({ onComplete }: GameProps) {
  const [source, setSource] = useState(() => renderFirmwareSource(DEFAULT_THRESHOLD));
  const [artifact, setArtifact] = useState<CompiledArtifact | null>(null);
  const [pumpsOff, setPumpsOff] = useState(false);
  const [solved, setSolved] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [manEntry, setManEntry] = useState<ManPageEntry | null>(null);

  function advanceTo(index: number) {
    setStageIndex((prev) => Math.min(STAGES.length - 1, Math.max(prev, index)));
  }

  function handlePumpsOff() {
    setPumpsOff(true);
    advanceTo(1);
  }

  function handleSourceChange(value: string) {
    setSource(value);
    const threshold = parseThreshold(value);
    if (threshold !== null && threshold !== DEFAULT_THRESHOLD) {
      advanceTo(2);
    }
  }

  function handleBuildLine(line: string): ConsoleLine[] {
    const result = runBuildCommand(line, { source, artifact });
    if (result.artifact) {
      setArtifact(result.artifact);
      advanceTo(3);
    }
    if (result.deviceThreshold !== undefined) {
      advanceTo(4);
      if (shouldWater(SENSOR_MOISTURE, SENSOR_AIR_TEMP, SENSOR_SUN, result.deviceThreshold)) {
        setSolved(true);
      }
    }
    return result.lines;
  }

  function handleReplLine(line: string): ConsoleLine[] {
    const threshold = parseThreshold(source) ?? DEFAULT_THRESHOLD;
    const result = runReplLine(line, threshold);
    if (result.length > 0 && result[0].stream === 'stdout') {
      advanceTo(4);
    }
    return result;
  }

  if (!introDismissed) {
    return <StoryIntro onStart={() => setIntroDismissed(true)} />;
  }

  return (
    <div className="greenhouse-firmware-game">
      <aside className="greenhouse-firmware-game__sidebar">
        <h2>Прошивка теплицы</h2>
        <ControllerIllustration pose={poseForProgress(pumpsOff, solved)} />
        {!solved ? (
          <>
            {!pumpsOff && (
              <button
                type="button"
                className="greenhouse-firmware-game__pumps-off"
                onClick={handlePumpsOff}
              >
                Выключить насосы
              </button>
            )}
            <p className="greenhouse-firmware-game__hint">{STAGES[stageIndex].hint}</p>
            <HintButton key={STAGES[stageIndex].id} command={STAGES[stageIndex].command} />
          </>
        ) : (
          <div className="greenhouse-firmware-game__solved">
            <p>
              Контроллер снова понимает датчики. Насос тихо щёлкнул реле — вода пошла к корням, а из
              земли уже проклюнулись первые ростки.
            </p>
            <button onClick={onComplete}>Продолжить</button>
          </div>
        )}
        <ManLinks label="Команды:" entries={COMMAND_ENTRIES} onSelect={setManEntry} />
      </aside>

      <div className="greenhouse-firmware-game__main">
        <div className="greenhouse-firmware-game__editor">
          <h3>firmware.c</h3>
          <textarea
            className="greenhouse-firmware-game__source"
            value={source}
            onChange={(event) => handleSourceChange(event.target.value)}
            spellCheck={false}
            aria-label="Исходный код firmware.c"
          />
        </div>
        <div className="greenhouse-firmware-game__consoles">
          <div className="greenhouse-firmware-game__console">
            <h3>Терминал сборки</h3>
            <ConsolePane prompt="gh-ctrl$" onSubmit={handleBuildLine} inputLabel="Терминал сборки" />
          </div>
          <div className="greenhouse-firmware-game__console">
            <h3>JS REPL</h3>
            <ConsolePane prompt=">" onSubmit={handleReplLine} inputLabel="JS REPL" />
          </div>
        </div>
      </div>

      {manEntry && <CommandReference entry={manEntry} onClose={() => setManEntry(null)} />}
    </div>
  );
}
