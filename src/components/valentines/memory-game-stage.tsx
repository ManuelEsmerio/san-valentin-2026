'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dog, Cat, Plane, Clapperboard, Pizza, Brush, Heart, Sailboat, CupSoda, Gem, Rabbit, Star,
  type LucideIcon, Timer, MousePointerClick, Award, BrainCircuit, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Card data
const cardIcons: { name: string; icon: LucideIcon }[] = [
  { name: 'Dog', icon: Dog },
  { name: 'Cat', icon: Cat },
  { name: 'Plane', icon: Plane },
  { name: 'Movie', icon: Clapperboard },
  { name: 'Pizza', icon: Pizza },
  { name: 'Lipstick', icon: Brush },
  { name: 'Couple', icon: Heart },
  { name: 'Travel', icon: Sailboat },
  { name: 'Drink', icon: CupSoda },
  { name: 'Special', icon: Gem },
  { name: 'Pet', icon: Rabbit },
  { name: 'Star', icon: Star },
];

const generateCards = () => {
  const duplicatedCards = [...cardIcons, ...cardIcons];
  return duplicatedCards
    .map((card, index) => ({
      id: index,
      name: card.name,
      icon: card.icon,
      isFlipped: false,
      isMatched: false,
    }))
    .sort(() => Math.random() - 0.5);
};

type CardType = {
  id: number;
  name: string;
  icon: LucideIcon;
  isFlipped: boolean;
  isMatched: boolean;
};

// Card component
const MemoryCard = ({ card, onClick, isDisabled }: { card: CardType; onClick: () => void; isDisabled: boolean }) => (
  <div className="aspect-square [perspective:1000px]" onClick={!isDisabled ? onClick : undefined}>
    <div
      className={cn(
        "relative w-full h-full [transform-style:preserve-3d] transition-transform duration-500",
        card.isFlipped || card.isMatched ? "[transform:rotateY(180deg)]" : ""
      )}
    >
      <div className="absolute w-full h-full [backface-visibility:hidden] bg-card rounded-lg flex items-center justify-center cursor-pointer border-2 border-primary/20 hover:border-primary">
        <Heart className="h-1/2 w-1/2 text-primary/30" />
      </div>
      <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-primary/10 rounded-lg flex items-center justify-center border-2 border-primary">
        <card.icon className="h-1/2 w-1/2 text-primary" />
      </div>
    </div>
  </div>
);

// Main component
type Props = {
  onSuccess: () => void;
};

export default function MemoryGameStage({ onSuccess }: Props) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won'>('idle');
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [isInstructionsOpen, setInstructionsOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout>();

  const resetGame = useCallback(() => {
    setCards(generateCards());
    setFlippedCards([]);
    setMoves(0);
    setTimer(0);
    setIsChecking(false);
    setGameState('idle');
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const startGame = () => {
    setInstructionsOpen(false);
    resetGame();
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const handleCardClick = (index: number) => {
    if (isChecking || flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    setFlippedCards([...flippedCards, index]);
  };

  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsChecking(true);
      setMoves(prev => prev + 1);
      const [firstIndex, secondIndex] = flippedCards;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.name === secondCard.name) {
        // Match
        const newCards = cards.map(card => 
          card.name === firstCard.name ? { ...card, isMatched: true, isFlipped: false } : card
        );
        setTimeout(() => {
          setCards(newCards);
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const newCards = cards.map(card => ({...card}));
          newCards[firstIndex].isFlipped = false;
          newCards[secondIndex].isFlipped = false;
          setCards(newCards);
          setFlippedCards([]);
          setIsChecking(false);
        }, 1200);
      }
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    const allMatched = cards.length > 0 && cards.every(card => card.isMatched);
    if (allMatched) {
      setGameState('won');
    }
  }, [cards]);

  const StatCard = ({ icon: Icon, title, value }: { icon: LucideIcon, title: string, value: string | number }) => (
    <div className="bg-card/50 dark:bg-zinc-800/30 border border-border p-4 rounded-2xl flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
        <Icon className="w-8 h-8" />
      </div>
      <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
      <span className="text-2xl font-bold text-foreground">{value}</span>
    </div>
  );

  if (gameState === 'idle') {
    return (
      <>
        <div className="w-full bg-card rounded-xl shadow-xl overflow-hidden border border-primary/5 animate-fade-in">
          <div className="p-6 sm:p-10 text-center flex flex-col items-center gap-4">
            <BrainCircuit className="h-16 w-16 text-primary" />
            <h2 className="text-foreground text-3xl font-bold leading-tight tracking-[-0.015em]">Desafío de Memoria</h2>
            <p className="text-muted-foreground max-w-md">
              Encuentra todos los pares que representan nuestros momentos y gustos. ¡Demuestra que tu memoria es tan buena como tu amor!
            </p>
            <Button onClick={() => setInstructionsOpen(true)} className="h-12 px-8 text-lg font-bold shadow-lg shadow-primary/20 mt-4" size="lg">
              <Play className="mr-2" />
              Jugar
            </Button>
          </div>
        </div>

        <Dialog open={isInstructionsOpen} onOpenChange={setInstructionsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center font-bold">Instrucciones: Memoria de Recuerdos</DialogTitle>
                    <DialogDescription asChild>
                        <div className="text-center pt-4 space-y-4 text-base text-muted-foreground">
                            <p>Voltea las cartas una por una para encontrar los 12 pares que representan nuestros recuerdos.</p>
                            <p className="font-bold text-primary italic">El objetivo es encontrar todos los pares en el menor tiempo y con la menor cantidad de movimientos posible.</p>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="pt-4">
                    <Button onClick={startGame} className="w-full h-12 text-lg font-bold">¡Comenzar!</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </>
    );
  }
  
  if (gameState === 'won') {
    return (
        <Dialog open={true} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">¡Felicidades, mi amor!</DialogTitle>
                     <DialogDescription asChild>
                      <div className="pt-4 space-y-2">
                        <Award className="h-12 w-12 text-primary mx-auto animate-pulse" />
                        <p className="text-base text-muted-foreground">"Cada recuerdo contigo es mi favorito ❤️"</p>
                        <div className="grid grid-cols-2 gap-4 pt-4 text-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Tiempo Total</p>
                            <p className="text-lg font-bold text-foreground">{timer}s</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Movimientos</p>
                            <p className="text-lg font-bold text-foreground">{moves}</p>
                          </div>
                        </div>
                      </div>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="pt-4">
                    <Button onClick={onSuccess} className="w-full h-12 text-lg font-bold">Continuar Aventura</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
        <div className="lg:col-span-8">
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-4 aspect-auto lg:h-full">
                {cards.map((card, index) => (
                    <MemoryCard
                        key={index}
                        card={card}
                        onClick={() => handleCardClick(index)}
                        isDisabled={isChecking}
                    />
                ))}
            </div>
        </div>
        <div className="lg:col-span-4 space-y-4">
            <StatCard icon={Timer} title="Tiempo" value={`${timer}s`} />
            <StatCard icon={MousePointerClick} title="Movimientos" value={moves} />
        </div>
    </div>
  );
}
