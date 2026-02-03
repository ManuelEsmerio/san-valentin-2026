'use client';

import { useState } from 'react';
import LoginStage from '@/components/valentines/login-stage';
import WelcomeStage from '@/components/valentines/welcome-stage';
import GameStage from '@/components/valentines/game-stage';
import TriviaStage from '@/components/valentines/trivia-stage';
import RevelationStage from '@/components/valentines/revelation-stage';

type Stage = 'login' | 'welcome' | 'game' | 'trivia' | 'revelation';

const stageInfo: Record<Stage, { step: number; title: string }> = {
  login: { step: 1, title: 'The Beginning' },
  welcome: { step: 1, title: 'Welcome' },
  game: { step: 2, title: 'El Snake de Corazones' },
  trivia: { step: 3, title: 'Trivia de Nuestro Amor' },
  revelation: { step: 4, title: 'The Surprise' },
};

export default function Home() {
  const [stage, setStage] = useState<Stage>('login');

  const currentStep = stageInfo[stage]?.step;
  const currentTitle = stageInfo[stage]?.title;

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

  return (
    <>
      <div className="text-center mb-8">
        {stage !== 'welcome' && stage !== 'revelation' && (
          <>
            <h1 className="text-primary tracking-light text-[24px] sm:text-[32px] font-bold leading-tight px-4 pb-1">
              Paso {currentStep} de 3
            </h1>
            <p className="text-muted-foreground text-lg font-medium">
              {currentTitle}
            </p>
          </>
        )}
      </div>

      <div className="w-full max-w-lg">{renderStage()}</div>

      {stage !== 'welcome' && stage !== 'revelation' && (
        <div className="mt-12 flex gap-2">
          <div
            className={`h-2 w-2 rounded-full transition-all ${
              currentStep === 1 ? 'w-8 bg-primary' : 'bg-primary/20'
            }`}
          ></div>
          <div
            className={`h-2 w-2 rounded-full transition-all ${
              currentStep === 2 ? 'w-8 bg-primary' : 'bg-primary/20'
            }`}
          ></div>
          <div
            className={`h-2 w-2 rounded-full transition-all ${
              currentStep === 3 ? 'w-8 bg-primary' : 'bg-primary/20'
            }`}
          ></div>
        </div>
      )}
    </>
  );
}
