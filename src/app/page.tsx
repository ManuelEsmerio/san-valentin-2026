'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import StageLoading from '@/components/valentines/StageLoading';

type Stage = 'login' | 'welcome' | 'game' | 'trivia' | 'puzzle' | 'revelation';

const stageInfo: Record<Stage, { step: number; title: string; subtitle: string }> = {
  login: { step: 0, title: 'El Inicio', subtitle: 'Verifica tu amor para comenzar.' },
  welcome: { step: 0, title: 'Un Momento', subtitle: '' },
  game: { step: 1, title: 'Desafío 1: Snake Game', subtitle: 'Usa las flechas del teclado para recolectar corazones' },
  trivia: { step: 2, title: 'Desafío 2: Trivia', subtitle: 'Demuestra cuánto nos conocemos' },
  puzzle: { step: 3, title: 'Desafío 3: Puzzle Fifteen', subtitle: 'Ordena los números para revelar la pista final' },
  revelation: { step: 4, title: 'La Sorpresa Final', subtitle: '' },
};

const CountdownStage = dynamic(() => import('@/components/valentines/countdown-stage'), {
  loading: () => <StageLoading />,
});
const LoginStage = dynamic(() => import('@/components/valentines/login-stage'), {
  loading: () => <StageLoading />,
});
const WelcomeStage = dynamic(() => import('@/components/valentines/welcome-stage'), {
  loading: () => <StageLoading />,
});
const GameStage = dynamic(() => import('@/components/valentines/game-stage'), {
  loading: () => <StageLoading />,
});
const TriviaStage = dynamic(() => import('@/components/valentines/trivia-stage'), {
  loading: () => <StageLoading />,
});
const PuzzleStage = dynamic(() => import('@/components/valentines/puzzle-stage'), {
  loading: () => <StageLoading />,
});
const RevelationStage = dynamic(() => import('@/components/valentines/revelation-stage'), {
  loading: () => <StageLoading />,
});

export default function Home() {
  const [showCountdown, setShowCountdown] = useState(true);
  const [stage, setStage] = useState<Stage>('login');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const savedStage = localStorage.getItem('valentines-app-stage') as Stage | null;
      if (savedStage && stageInfo[savedStage]) {
        setStage(savedStage);
        setShowCountdown(false);
      }
    }
  }, [isClient]);

  const setStageAndSave = useCallback((newStage: Stage) => {
    if (isClient) {
      localStorage.setItem('valentines-app-stage', newStage);
    }
    setStage(newStage);
  }, [isClient]);

  if (showCountdown && isClient) {
    return <CountdownStage onComplete={() => setShowCountdown(false)} />;
  }

  if (!isClient) {
    return <StageLoading />;
  }

  const currentStep = stageInfo[stage]?.step;
  const currentTitle = stageInfo[stage]?.title;
  const currentSubtitle = stageInfo[stage]?.subtitle;
  const progress = Math.max(0, currentStep - 1) / 3 * 100;

  const renderStage = () => {
    switch (stage) {
      case 'login':
        return <LoginStage key="login" onSuccess={() => setStageAndSave('welcome')} />;
      case 'welcome':
        return <WelcomeStage key="welcome" onSuccess={() => setStageAndSave('game')} />;
      case 'game':
        return <GameStage key="game" onSuccess={() => setStageAndSave('trivia')} />;
      case 'trivia':
        return <TriviaStage key="trivia" onSuccess={() => setStageAndSave('puzzle')} />;
      case 'puzzle':
        return <PuzzleStage key="puzzle" onSuccess={() => setStageAndSave('revelation')} />;
      case 'revelation':
        return <RevelationStage key="revelation" />;
      default:
        return <LoginStage key="login" onSuccess={() => setStageAndSave('welcome')} />;
    }
  };

  const containerClass = stage === 'game' || stage === 'trivia' ? 'max-w-5xl' : stage === 'revelation' || stage === 'puzzle' ? 'max-w-2xl' : 'max-w-lg';

  return (
    <div className="w-full flex flex-col items-center">
      {(stage === 'game' || stage === 'trivia' || stage === 'puzzle') && (
        <div className={cn("w-full text-center mb-6", containerClass)}>
          <h1 className="text-foreground tracking-light text-[24px] sm:text-[40px] font-bold leading-tight px-4 pb-1">
            {currentTitle}
          </h1>
          <p className="text-primary text-lg font-medium">
            {currentSubtitle}
          </p>
        </div>
      )}

      {(stage === 'game' || stage === 'trivia' || stage === 'puzzle') && (
        <div className={cn("w-full flex flex-col gap-3 p-4 bg-card/50 rounded-xl mb-6 border border-border", containerClass)}>
          <div className="flex gap-4 justify-between items-center">
            <p className="text-foreground/90 text-base font-medium leading-normal">
              Progreso del Desafío
            </p>
            <div className="flex items-center gap-4">
              <p className="text-primary text-sm font-bold leading-normal">
                {currentStep - 1} de 3 Completados
              </p>
            </div>
          </div>
          <Progress value={progress} className="h-3"/>
        </div>
      )}

      <div className={cn("w-full", containerClass)}>{renderStage()}</div>
    </div>
  );
}
