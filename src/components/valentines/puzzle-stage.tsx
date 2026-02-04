'use client';

import FifteenPuzzleModal from './FifteenPuzzleModal';

type PuzzleStageProps = {
  onSuccess: () => void;
  user: string | null;
};

export default function PuzzleStage({ onSuccess, user }: PuzzleStageProps) {
  // The modal is always open for this stage.
  return (
      <FifteenPuzzleModal
        isOpen={true}
        onSuccess={onSuccess}
        user={user}
      />
  );
}
