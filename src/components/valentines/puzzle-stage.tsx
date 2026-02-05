'use client';

import FifteenPuzzleModal from './FifteenPuzzleModal';

type PuzzleStageProps = {
  onGameWon: () => void;
  onAdvance?: () => void;
  user: string | null;
  initialGameState?: 'playing' | 'solved' | 'lost';
};

export default function PuzzleStage({ onGameWon, onAdvance, user, initialGameState }: PuzzleStageProps) {
  // The modal is always open for this stage.
  return (
      <FifteenPuzzleModal
        isOpen={true}
        onAdvance={onAdvance}
        onGameWon={onGameWon}
        user={user}
        initialGameState={initialGameState}
      />
  );
}
