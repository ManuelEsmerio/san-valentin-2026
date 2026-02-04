'use client';

import { useState, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

type EmotionalState = {
  emoji: string;
  text: string;
};

const emotionalStates: { range: [number, number]; state: EmotionalState }[] = [
  { range: [0, 2], state: { emoji: '😢', text: 'Apenas empezamos...' } },
  { range: [3, 5], state: { emoji: '😭', text: 'Esto es más difícil de lo que pensaba.' } },
  { range: [6, 8], state: { emoji: '🥺', text: 'Ok, necesito concentrarme.' } },
  { range: [9, 10], state: { emoji: '😐', text: 'Punto medio. Momento de seriedad.' } },
  { range: [11, 13], state: { emoji: '🙂', text: 'Ok... vamos bien.' } },
  { range: [14, 16], state: { emoji: '😊', text: 'Me gusta este punto.' } },
  { range: [17, 18], state: { emoji: '😍', text: '¡Ya casi llegamos!' } },
  { range: [19, 19], state: { emoji: '😍💖', text: 'Así se siente llegar juntos.' } },
];

const getEmotionalState = (questionNumber: number): EmotionalState => {
  // We use questionNumber - 1 for arrays, but the logic is based on 1-19
  const currentQuestion = Math.max(1, questionNumber);
  const foundState = emotionalStates.find(({ range }) => currentQuestion >= range[0] && currentQuestion <= range[1]);
  return foundState ? foundState.state : { emoji: '😢', text: 'Apenas empezamos...' };
};


const HeartConfetti = memo(() => {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-primary text-xl"
            style={{
              animation: `confetti-fall ${2 + Math.random() * 2}s ${Math.random() * 4}s linear infinite`,
              left: `${Math.random() * 100}%`,
              top: '-20px',
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          >
            💖
          </div>
        ))}
      </div>
    );
});
HeartConfetti.displayName = 'HeartConfetti';

type CircularProgressProps = {
  current: number;
  total: number;
};

function CircularProgress({ current, total }: CircularProgressProps) {
  const [emojiState, setEmojiState] = useState(getEmotionalState(0));
  const [isAnimating, setIsAnimating] = useState(false);

  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const progress = total > 0 ? (current / total) * 100 : 0;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const newState = getEmotionalState(current);
    if (newState.emoji !== emojiState.emoji) {
      setIsAnimating(true);
      setTimeout(() => {
        setEmojiState(newState);
        setIsAnimating(false);
      }, 200); // Half of the animation duration
    } else if (current === 0) {
        setEmojiState(newState);
    }
  }, [current, emojiState.emoji]);


  return (
    <div className="relative flex flex-col items-center justify-center gap-4">
      <div className="relative w-44 h-44">
        <svg
          height="100%"
          width="100%"
          viewBox="0 0 200 200"
          className="transform -rotate-90"
        >
          <circle
            stroke="hsl(var(--primary) / 0.1)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx="100"
            cy="100"
          />
          <circle
            stroke="hsl(var(--primary))"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="100"
            cy="100"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
            <div
                className={cn(
                    'text-5xl transition-all duration-300 ease-in-out transform',
                    isAnimating ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
                )}
            >
                {emojiState.emoji}
            </div>
        </div>
        {current === total && total > 0 && <HeartConfetti />}
      </div>
      <div className="text-center h-12">
        <p className="text-muted-foreground font-medium transition-opacity duration-300">
            {emojiState.text}
        </p>
         <p className="font-bold text-lg text-foreground">
            {current} / {total}
        </p>
      </div>
    </div>
  );
}

export default memo(CircularProgress);
