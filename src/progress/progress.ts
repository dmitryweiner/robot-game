export interface Progress {
  completedGameIds: string[];
  /** Whether the player has dismissed the global "what is this game" intro at least once. */
  introSeen: boolean;
}

export const STORAGE_KEY = 'robot-game:progress:v1';

const EMPTY_PROGRESS: Progress = { completedGameIds: [], introSeen: false };

function isProgress(value: unknown): value is Progress {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('completedGameIds' in value) ||
    !('introSeen' in value)
  ) {
    return false;
  }
  const { completedGameIds, introSeen } = value;
  return (
    Array.isArray(completedGameIds) &&
    completedGameIds.every((id) => typeof id === 'string') &&
    typeof introSeen === 'boolean'
  );
}

export function loadProgress(): Progress {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { ...EMPTY_PROGRESS };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return isProgress(parsed) ? parsed : { ...EMPTY_PROGRESS };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function markGameCompleted(gameId: string): Progress {
  const progress = loadProgress();
  const completedGameIds = progress.completedGameIds.includes(gameId)
    ? progress.completedGameIds
    : [...progress.completedGameIds, gameId];
  const next = { ...progress, completedGameIds };
  saveProgress(next);
  return next;
}

export function markIntroSeen(): Progress {
  const next = { ...loadProgress(), introSeen: true };
  saveProgress(next);
  return next;
}

export function isGameCompleted(gameId: string, progress: Progress): boolean {
  return progress.completedGameIds.includes(gameId);
}

export function isGameUnlocked(gameId: string, gameOrder: string[], progress: Progress): boolean {
  const index = gameOrder.indexOf(gameId);
  if (index === -1) {
    return false;
  }
  if (index === 0) {
    return true;
  }
  return isGameCompleted(gameOrder[index - 1], progress);
}
