'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import StageLoading from '@/components/valentines/StageLoading';
import { Heart } from 'lucide-react';

type Stage = 'login' | 'welcome' | 'game' | 'catch-hearts' | 'trivia' | 'memory-game' | 'puzzle' | 'revelation';

const stageInfo: Record<Stage, { step: number; title: string; subtitle: string }> = {
  login: { step: 0, title: 'El Inicio', subtitle: 'Verifica tu amor para comenzar.' },
  welcome: { step: 0, title: 'Un Momento', subtitle: '' },
  game: { step: 1, title: 'Desafío 1: Snake Romance', subtitle: 'Guía al corazón y recolecta todos los puntos.' },
  'catch-hearts': { step: 2, title: 'Desafío 2: Atrapa los Detalles del Amor', subtitle: 'Cada detalle cuenta en esta lluvia de amor.' },
  trivia: { step: 3, title: 'Desafío 3: Trivia de Recuerdos', subtitle: 'Demuestra cuánto nos conocemos.' },
  'memory-game': { step: 4, title: 'Desafío 4: Memoria de Recuerdos', subtitle: 'Encuentra los pares.' },
  puzzle: { step: 5, title: 'Desafío 5: Puzzle Fifteen', subtitle: 'Ordena los números para revelar la pista final' },
  revelation: { step: 6, title: 'La Sorpresa Final', subtitle: 'Has llegado al final de la aventura.' },
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
  const totalChallenges = 5;
  const challengeProgress = Math.max(0, currentStep - 1);
  const isChallengeStage = stage !== 'login' && stage !== 'welcome' && stage !== 'revelation';
  
  const [challengeLabel, ...titleParts] = currentTitle.split(': ');
  const mainTitle = titleParts.join(': ');
  const words = mainTitle.split(' ');
  const lastWord = words.pop() || '';
  const restOfTitle = words.join(' ');
  const challengeNum = String(currentStep).padStart(2, '0');

  const renderStage = () => {
    switch (stage) {
      case 'login':
        return <LoginStage key="login" onSuccess={handleLoginSuccess} />;
      case 'welcome':
        return <WelcomeStage key="welcome" onSuccess={() => setStageAndSave('game')} />;
      case 'game':
        return <GameStage key="game" onSuccess={() => setStageAndSave('catch-hearts')} user={loggedInUser} />;
      case 'catch-hearts':
        return <CatchHeartsStage key="catch-hearts" onSuccess={() => setStageAndSave('trivia')} user={loggedInUser} />;
      case 'trivia':
        return <TriviaStage key="trivia" onSuccess={() => setStageAndSave('memory-game')} user={loggedInUser} />;
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
      {isChallengeStage && (
        <div className={cn("w-full mb-6", containerClass)}>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-primary font-semibold tracking-wider uppercase text-sm">
                Desafío {challengeNum}
              </p>
              <h1 className="text-foreground tracking-tight text-[28px] sm:text-[40px] font-bold leading-none mt-1">
                {restOfTitle}{' '}
                <span className="text-primary">{lastWord}</span>
              </h1>
            </div>
            <div className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full shrink-0 mb-1">
              {challengeProgress} de {totalChallenges} Completados
            </div>
          </div>
        </div>
      )}

      {isChallengeStage && (
        <div className={cn("w-full bg-card rounded-2xl p-4 shadow-sm mb-6", containerClass)}>
          <div className="flex items-center">
              {Array.from({ length: totalChallenges }).map((_, index) => {
                  const isHeartActive = index < challengeProgress;
                  const isHeartCurrent = index === challengeProgress;

                  return (
                      <Fragment key={index}>
                          <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all z-10",
                              (isHeartActive || isHeartCurrent) ? "bg-card border-primary" : "bg-card border-muted-foreground/20"
                          )}>
                              <Heart 
                                  className={cn(
                                      "w-4 h-4 transition-colors",
                                      (isHeartActive || isHeartCurrent) ? "text-primary" : "text-muted-foreground/30"
                                  )} 
                                  fill={(isHeartActive || isHeartCurrent) ? 'currentColor' : 'none'}
                              />
                          </div>
                          {index < totalChallenges - 1 && (
                              <div className={cn(
                                  "flex-1 h-1 transition-colors -mx-1",
                                  isHeartActive ? "bg-primary" : "bg-muted"
                              )} />
                          )}
                      </Fragment>
                  )
              })}
          </div>
        </div>
      )}

      <div className={cn("w-full", containerClass)}>{renderStage()}</div>
    </div>
  );
}
