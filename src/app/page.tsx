'use client';

import { useState, useEffect } from 'react';
import CountdownStage from '@/components/valentines/countdown-stage';
import LoginStage from '@/components/valentines/login-stage';
import WelcomeStage from '@/components/valentines/welcome-stage';
import GameStage from '@/components/valentines/game-stage';
import TriviaStage from '@/components/valentines/trivia-stage';
import RevelationStage from '@/components/valentines/revelation-stage';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type Stage = 'login' | 'welcome' | 'game' | 'trivia' | 'revelation';

const stageInfo: Record<Stage, { step: number; title: string }> = {
  login: { step: 1, title: 'El Inicio' },
  welcome: { step: 1, title: 'Un Momento' },
  game: { step: 2, title: 'El Recorrido' },
  trivia: { step: 3, title: 'Lo Que Sabemos' },
  revelation: { step: 4, title: 'Aquí' },
};

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

  const setStageAndSave = (newStage: Stage) => {
    if (isClient) {
      localStorage.setItem('valentines-app-stage', newStage);
    }
    setStage(newStage);
  };

  // Only show countdown if the state is still true and no stage has been loaded from storage.
  if (showCountdown && isClient) {
    return <CountdownStage onComplete={() => setShowCountdown(false)} />;
  }

  // A simple loading state to prevent flash of content before client-side check is complete.
  if (!isClient) {
    return null; 
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
