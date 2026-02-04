'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type Stage = 'login' | 'welcome' | 'game' | 'trivia' | 'revelation';

const stageInfo: Record<Stage, { step: number; title: string }> = {
  login: { step: 1, title: 'El Inicio' },
  welcome: { step: 1, title: 'Un Momento' },
  game: { step: 2, title: 'El Recorrido' },
  trivia: { step: 3, title: 'Lo Que Sabemos' },
  revelation: { step: 4, title: 'Aquí' },
};

const StageLoading = () => (
  <div className="w-full max-w-lg mx-auto">
    <Skeleton className="h-[450px] w-full rounded-xl" />
  </div>
);

const CountdownStage = dynamic(() => import('@/components/valentines/countdown-stage'), {
  loading: () => <div className="fixed inset-0" />,
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
const RevelationStage = dynamic(() => import('@/components/valentines/revelation-stage'), {
  loading: () => <StageLoading />,
});


export default function Home() {
  const [showCountdown, setShowCountdown] = useState(true);
  const [stage, setStage] = useState<Stage>('login');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs once on mount to confirm we are on the client.
    setIsClient(true);
  }, []);

  useEffect(() => {
    // This effect runs after we know we're on the client.
    if (isClient) {
      const savedStage = localStorage.getItem('valentines-app-stage') as Stage | null;
      if (savedStage && stageInfo[savedStage]) {
        // If there's a saved stage, use it and don't show the countdown.
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

  // Only show countdown if the state is still true and no stage has been loaded from storage.
  if (showCountdown && isClient) {
    return <CountdownStage onComplete={() => setShowCountdown(false)} />;
  }

  // A simple loading state to prevent flash of content before client-side check is complete.
  if (!isClient) {
    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-lg">
                <StageLoading/>
            </div>
        </div>
    );
  }

  const currentStep = stageInfo[stage]?.step;
  const currentTitle = stageInfo[stage]?.title;
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
        return (
          <TriviaStage
            key="trivia"
            onSuccess={() => setStageAndSave('revelation')}
          />
        );
      case 'revelation':
        return <RevelationStage key="revelation" />;
      default:
        return <LoginStage key="login" onSuccess={() => setStageAndSave('welcome')} />;
    }
  };

  const containerClass = (stage === 'game' || stage === 'trivia') ? 'max-w-5xl' : (stage === 'revelation' ? 'max-w-2xl' : 'max-w-lg');

  return (
    <div className="w-full flex flex-col items-center">
      <div className={cn("w-full text-center mb-6", containerClass)}>
        {stage !== 'welcome' && stage !== 'revelation' && (
          <>
            <h1 className="text-foreground tracking-light text-[24px] sm:text-[40px] font-bold leading-tight px-4 pb-1">
              Step {currentStep}: {currentTitle}
            </h1>
            <p className="text-primary text-lg font-medium">
              {stage === 'game' ? 'Usa las flechas del teclado para recolectar corazones' : 'Demuestra cuánto nos conocemos'}
            </p>
          </>
        )}
      </div>

      {stage !== 'welcome' && stage !== 'revelation' && stage !== 'login' && stage !== 'trivia' && (
        <div className={cn("w-full flex flex-col gap-3 p-4 bg-card/50 rounded-xl mb-6 border border-border", containerClass)}>
          <div className="flex gap-4 justify-between items-center">
            <p className="text-foreground/90 text-base font-medium leading-normal">
              Progreso del Desafío
            </p>
            <div className="flex items-center gap-4">
              <p className="text-primary text-sm font-bold leading-normal">
                {currentStep-1} de 3 Completados
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
