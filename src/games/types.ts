import type { ComponentType } from 'react';

export interface GameProps {
  onComplete: () => void;
}

export interface GameDescriptor {
  id: string;
  chapterNumber: number;
  title: string;
  shortDescription: string;
  Component: ComponentType<GameProps>;
}
