'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import LoginStage from '@/components/valentines/login-stage';
import WelcomeStage from '@/components/valentines/welcome-stage';
import GameStage from '@/components/valentines/game-stage';
import TriviaStage from '@/components/valentines/trivia-stage';
import RevelationStage from '@/components/valentines/revelation-stage';

type Stage = 'login' | 'welcome' | 'game' | 'trivia' | 'revelation';

export default function Home() {
  const [stage, setStage] = useState<Stage>('login');

  const renderStage = () => {
    switch (stage) {
      case 'login':
        return <LoginStage key="login" onSuccess={() => setStage('welcome')} />;
      case 'welcome':
        return <WelcomeStage key="welcome" onSuccess={() => setStage('game')} />;
      case 'game':
        return <GameStage key="game" onSuccess={() => setStage('trivia')} />;
      case 'trivia':
        return <TriviaStage key="trivia" onSuccess={() => setStage('revelation')} />;
      case 'revelation':
        return <RevelationStage key="revelation" />;
      default:
        return <LoginStage key="login" onSuccess={() => setStage('welcome')} />;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background text-foreground">
      <div className="flex flex-col items-center text-center mb-8">
        <Heart className="w-12 h-12 text-primary animate-heart-beat" />
        <h1 className="font-headline text-4xl md:text-6xl mt-4 text-primary">
          San Valentín Mágico
        </h1>
        <p className="font-body text-lg mt-2 text-muted-foreground">Un desafío para la persona que más amo.</p>
      </div>
      <div className="w-full max-w-md animate-fade-in">
        {renderStage()}
      </div>
      <footer className="mt-8 text-center text-muted-foreground font-body text-sm">
        <p>Hecho con mucho amor para ti 💖</p>
      </footer>
    </main>
  );
}
