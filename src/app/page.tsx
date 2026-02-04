'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import StageLoading from '@/components/valentines/StageLoading';

type Stage = 'login' | 'welcome' | 'game' | 'catch-hearts' | 'trivia' | 'memory-game' | 'puzzle' | 'revelation';

const stageInfo: Record<Stage, { step: number; title: string; subtitle: string }> = {
  login: { step: 0, title: 'El Inicio', subtitle: 'Verifica tu amor para comenzar.' },
  welcome: { step: 0, title: 'Un Momento', subtitle: '' },
  game: { step: 1, title: 'Desafío 1: Snake Romance', subtitle: '' },
  'catch-hearts': { step: 2, title: 'Desafío 2: Atrapa los Detalles del Amor', subtitle: 'Cada detalle cuenta en esta lluvia de amor.' },
  trivia: { step: 3, title: 'Desafío 3: Trivia', subtitle: 'Demuestra cuánto nos conocemos' },
  'memory-game': { step: 4, title: 'Desafío 4: Memoria de Recuerdos', subtitle: 'Encuentra los pares.' },
  puzzle: { step: 5, title: 'Desafío 5: Puzzle Fifteen', subtitle: 'Ordena los números para revelar la pista final' },
  revelation: { step: 6, title: 'La Sorpresa Final', subtitle: '' },
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
const CatchHeartsStage = dynamic(() => import('@/components/valentines/catch-hearts-stage'), {
  loading: () => <StageLoading />,
});
const TriviaStage = dynamic(() => import('@/components/valentines/trivia-stage'), {
  loading: () => <StageLoading />,
});
const MemoryGameStage = dynamic(() => import('@/components/valentines/memory-game-stage'), {
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
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const savedStage = localStorage.getItem('valentines-app-stage') as Stage | null;
      const savedUser = localStorage.getItem('valentines-app-user');
      if (savedUser) {
        setLoggedInUser(savedUser);
      }
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

  const handleLoginSuccess = useCallback((nickname: string) => {
    if (isClient) {
      localStorage.setItem('valentines-app-user', nickname);
    }
    setLoggedInUser(nickname);
    setStageAndSave('welcome');
  }, [isClient, setStageAndSave]);

  if (showCountdown && isClient) {
    return <CountdownStage onComplete={() => setShowCountdown(false)} />;
  }

  if (!isClient) {
    return <StageLoading />;
  }

  const currentStep = stageInfo[stage]?.step;
  const currentTitle = stageInfo[stage]?.title;
  const currentSubtitle = stageInfo[stage]?.subtitle;
  const totalChallenges = 5;
  const progress = Math.max(0, currentStep - 1) / totalChallenges * 100;

  const renderStage = () => {
    switch (stage) {
      case 'login':
        return <LoginStage key="login" onSuccess={handleLoginSuccess} />;
      case 'welcome':
        return <WelcomeStage key="welcome" onSuccess={() => setStageAndSave('game')} />;
      case 'game':
        return <GameStage key="game" onSuccess={() => setStageAndSave('catch-hearts')} user={loggedInUser} />;
      case 'catch-hearts':
        return <CatchHeartsStage key="catch-hearts" onSuccess={() => setStageAndSave('trivia')} />;
      case 'trivia':
        return <TriviaStage key="trivia" onSuccess={() => setStageAndSave('memory-game')} />;
      case 'memory-game':
        return <MemoryGameStage key="memory-game" onSuccess={() => setStageAndSave('puzzle')} />;
      case 'puzzle':
        return <PuzzleStage key="puzzle" onSuccess={() => setStageAndSave('revelation')} />;
      case 'revelation':
        return <RevelationStage key="revelation" />;
      default:
        return <LoginStage key="login" onSuccess={handleLoginSuccess} />;
    }
  };

  const containerClass = stage === 'game' || stage === 'catch-hearts' || stage === 'trivia' ? 'max-w-5xl' : stage === 'revelation' || stage === 'puzzle' ? 'max-w-2xl' : 'max-w-lg';

  return (
    <div className="w-full flex flex-col items-center">
      {(stage !== 'game' && stage !== 'catch-hearts' && (stage === 'trivia' || stage === 'puzzle' || stage === 'memory-game')) && (
        <div className={cn("w-full text-center mb-6", containerClass)}>
          <h1 className="text-foreground tracking-light text-[24px] sm:text-[40px] font-bold leading-tight px-4 pb-1">
            {currentTitle}
          </h1>
          <p className="text-primary text-lg font-medium">
            {currentSubtitle}
          </p>
        </div>
      )}

      {(stage !== 'game' && stage !== 'catch-hearts' && (stage === 'trivia' || stage === 'puzzle' || stage === 'memory-game')) && (
        <div className={cn("w-full flex flex-col gap-3 p-4 bg-card/50 rounded-xl mb-6 border border-border", containerClass)}>
          <div className="flex gap-4 justify-between items-center">
            <p className="text-foreground/90 text-base font-medium leading-normal">
              Progreso del Desafío
            </p>
            <div className="flex items-center gap-4">
              <p className="text-primary text-sm font-bold leading-normal">
                {currentStep - 1} de {totalChallenges} Completados
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
