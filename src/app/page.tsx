'use client';

import { useState } from 'react';
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
  login: { step: 1, title: 'The Beginning' },
  welcome: { step: 1, title: 'Welcome' },
  game: { step: 2, title: 'El Snake de Corazones' },
  trivia: { step: 3, title: 'Trivia de Nuestro Amor' },
  revelation: { step: 4, title: 'The Surprise' },
};

export default function Home() {
  const [showCountdown, setShowCountdown] = useState(true);
  const [stage, setStage] = useState<Stage>('login');

  if (showCountdown) {
    return <CountdownStage onComplete={() => setShowCountdown(false)} />;
  }

  const currentStep = stageInfo[stage]?.step;
  const currentTitle = stageInfo[stage]?.title;
  const progress = Math.max(0, currentStep - 1) / 3 * 100;

  const renderStage = () => {
    switch (stage) {
      case 'login':
        return <LoginStage key="login" onSuccess={() => setStage('welcome')} />;
      case 'welcome':
        return <WelcomeStage key="welcome" onSuccess={() => setStage('game')} />;
      case 'game':
        return <GameStage key="game" onSuccess={() => setStage('trivia')} />;
      case 'trivia':
        return (
          <TriviaStage key="trivia" onSuccess={() => setStage('revelation')} />
        );
      case 'revelation':
        return <RevelationStage key="revelation" />;
      default:
        return <LoginStage key="login" onSuccess={() => setStage('welcome')} />;
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

      {stage !== 'welcome' && stage !== 'revelation' && stage !== 'login' && (
        <div className={cn("w-full flex flex-col gap-3 p-4 bg-card/50 rounded-xl mb-6 border border-border", containerClass)}>
          <div className="flex gap-6 justify-between">
            <p className="text-foreground/90 text-base font-medium leading-normal">
              Progreso del Desafío
            </p>
            <p className="text-primary text-sm font-bold leading-normal">
              {currentStep-1} de 3 Completados
            </p>
          </div>
          <Progress value={progress} className="h-3"/>
        </div>
      )}


      <div className={cn("w-full", containerClass)}>{renderStage()}</div>
    </div>
  );
}
