'use client';

import FifteenPuzzleModal from './FifteenPuzzleModal';

type PuzzleStageProps = {
  onSuccess: () => void;
};

export default function PuzzleStage({ onSuccess }: PuzzleStageProps) {
  // The modal is always open for this stage.
  return (
      <FifteenPuzzleModal
        isOpen={true}
        onSuccess={onSuccess}
      />
  );
}
