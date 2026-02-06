'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  Dog, Cat, Plane, Clapperboard, Pizza, Brush, Heart, Sailboat, CupSoda, Gem, Rabbit, Star,
  type LucideIcon, Timer, Trophy, Lock, LockOpen, Gamepad2, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import SimpleCircularProgress from './SimpleCircularProgress';
import MapModal from './MapModal';
import KeywordModal from './KeywordModal';

// --- Card Data ---
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

// --- Constants ---
const TOTAL_PAIRS = 12;
const PAIRS_ON_EASY_MODE = 8;
const GAME_DURATION = 75; // Increased from 60
const BEST_TIME_KEY = 'valentines-memory-besttime';


type CardType = {
  id: number;
  name: string;
  icon: LucideIcon;
  isFlipped: boolean;
  isMatched: boolean;
};

// --- Card Component ---
const MemoryCard = memo(({ card, onClick, isDisabled }: { card: CardType; onClick: () => void; isDisabled: boolean }) => (
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
));
MemoryCard.displayName = 'MemoryCard';

type GameState = 'idle' | 'playing' | 'won' | 'lost';

// --- Main Component ---
type Props = {
  onGameWon?: () => void;
  onAdvance?: () => void;
  user: string | null;
  initialGameState?: GameState;
};

export default function MemoryGameStage({ onGameWon, onAdvance, user, initialGameState = 'idle' }: Props) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const [isChecking, setIsChecking] = useState(false);
  const [isInstructionsOpen, setInstructionsOpen] = useState(false);
  const [isMapModalOpen, setMapModalOpen] = useState(false);
  const [isKeywordModalOpen, setKeywordModalOpen] = useState(false);

  const [losses, setLosses] = useState(0);
  const [numPairs, setNumPairs] = useState(TOTAL_PAIRS);

  const timerRef = useRef<NodeJS.Timeout>();

  const coordinates = "20.88215° N, 103.83882° W";
  const lat = "20.88215";
  const long = "-103.83882";
  const googleMapsUrl = `https://maps.app.goo.gl/1f512oqmcCxUe31z8`;
  const iframeUrl = `https://maps.google.com/maps?q=${lat},${long}&hl=es&z=14&output=embed`;
  const CORRECT_KEYWORD = "Lado";

  const generateCards = useCallback((pairs: number) => {
    const iconsToUse = cardIcons.slice(0, pairs);
    const duplicatedCards = [...iconsToUse, ...iconsToUse];
    return duplicatedCards
      .map((card, index) => ({
        id: index,
        name: card.name,
        icon: card.icon,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);
  }, []);

  useEffect(() => {
    const storedBestTime = localStorage.getItem(BEST_TIME_KEY);
    if (storedBestTime) {
      setBestTime(parseInt(storedBestTime, 10));
    }
    setCards(generateCards(numPairs));
  }, [generateCards, numPairs]);

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCards(generateCards(numPairs));
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setTimeLeft(GAME_DURATION);
    setIsChecking(false);
    setGameState('idle');
  }, [generateCards, numPairs]);

  const startGame = () => {
    setInstructionsOpen(false);
    resetGame();
    setGameState('playing');
  };
  
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
        const newLosses = losses + 1;
        setLosses(newLosses);
        if (newLosses >= 2) {
            setNumPairs(PAIRS_ON_EASY_MODE);
        }
        setGameState('lost');
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timeLeft, losses]);


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
        setMatchedPairs(prev => prev + 1);
        const newCards = cards.map(card => 
          card.name === firstCard.name ? { ...card, isMatched: true, isFlipped: true } : card
        );
        setTimeout(() => {
          setCards(newCards);
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
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
    if (matchedPairs === numPairs && gameState !== 'won' && numPairs > 0) {
      setGameState('won');
      if (timerRef.current) clearInterval(timerRef.current);
      const timeTaken = GAME_DURATION - timeLeft;

      if (bestTime === null || timeTaken < bestTime) {
        setBestTime(timeTaken);
        localStorage.setItem(BEST_TIME_KEY, timeTaken.toString());
      }
      setLosses(0);
      setNumPairs(TOTAL_PAIRS);
    }
  }, [matchedPairs, gameState, numPairs, timeLeft, bestTime, moves]);

  useEffect(() => {
    if (gameState === 'won' && initialGameState !== 'won') {
      onGameWon?.();
    }
  }, [gameState, initialGameState, onGameWon]);

  const handleWin = useCallback(() => {
    setMapModalOpen(true);
  }, []);

  const handleOpenKeywordModal = useCallback(() => {
    setMapModalOpen(false);
    setKeywordModalOpen(true);
  }, []);

  const handleKeywordSuccess = useCallback(() => {
    setKeywordModalOpen(false);
    onAdvance?.();
  }, [onAdvance]);

  const handleReturnToMap = useCallback(() => {
    setKeywordModalOpen(false);
    setMapModalOpen(true);
  }, []);

  const GameOverlay = ({ status }: { status: 'won' | 'lost' }) => {
    const isWon = status === 'won';
    const timeTaken = GAME_DURATION - timeLeft;
    const title = isWon ? "¡Victoria!" : "¡Se acabó el tiempo!";
    const description = isWon 
        ? `Completado en ${timeTaken}s con ${moves} movimientos.` 
        : losses >= 1 ? "No te preocupes, ahora será más fácil. ¡Inténtalo de nuevo!" : "No te preocupes, ¡inténtalo de nuevo!";
    const icon = isWon ? 'auto_awesome' : 'replay';

    return (
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-10 animate-fade-in">
        <div className="bg-card p-8 rounded-2xl shadow-2xl max-w-sm w-full">
            <div className={cn("h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center", isWon ? "bg-green-100 dark:bg-green-900/30" : "bg-primary/10")}>
                <span className={cn("material-symbols-outlined text-4xl", isWon ? "text-green-500" : "text-primary")}>{icon}</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground mb-6">{description}</p>
            <Button onClick={isWon ? handleWin : startGame} className="w-full h-12 text-lg font-bold">
            {isWon ? 'Ver Pista' : 'Reintentar'}
            </Button>
        </div>
      </div>
    );
  };
  
  const hintProgress = numPairs > 0 ? (matchedPairs / numPairs) * 100 : 0;
  const isGameOver = gameState === 'won' || gameState === 'lost';
  const gridClass = numPairs === PAIRS_ON_EASY_MODE ? "grid-cols-4" : "grid-cols-6";
  
  return (
    <>
      <div className="w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          <div className="lg:col-span-8 relative">
            <div className={cn("relative overflow-hidden aspect-square flex flex-col items-center justify-center gap-6 rounded-2xl bg-card p-0 border-2 border-primary/10")}>
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:30px_30px]"></div>

              {gameState === 'idle' && (
                <div className="flex flex-col items-center gap-4 z-10 text-center animate-fade-in p-8">
                  <div className="relative bg-background w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border border-primary/10">
                    <Gamepad2 className="text-primary h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground pt-4">Memoria de Recuerdos</h3>
                  <p className="max-w-xs text-muted-foreground">Para seguir avanzando, debes de completar este desafío.</p>
                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                    <Button onClick={() => setInstructionsOpen(true)} className="h-12 px-8 rounded-lg text-base font-bold tracking-wider shadow-lg shadow-primary/20" size="lg">
                      Empezar Desafío
                    </Button>
                    {user === 'manuel' && (
                        <Button onClick={onGameWon} variant="outline" className="h-12">
                            Saltar Desafío (Dev)
                        </Button>
                    )}
                  </div>
                </div>
              )}
              
              {(gameState === 'playing' || isGameOver) && (
                <div className="p-4 sm:p-6 w-full h-full">
                  <div className={cn("grid gap-2 sm:gap-4", gridClass)}>
                    {cards.map((card, index) => (
                      <MemoryCard
                        key={index}
                        card={card}
                        onClick={() => handleCardClick(index)}
                        isDisabled={isChecking || isGameOver}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {isGameOver && <GameOverlay status={gameState} />}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-card/50 dark:bg-zinc-800/30 border border-border p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <SimpleCircularProgress progress={hintProgress} size={80} strokeWidth={6}>
                    <Heart className="h-6 w-6 text-primary" />
                  </SimpleCircularProgress>
                  <span className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">PARES</span>
                  <span className="text-2xl font-bold text-foreground">{matchedPairs}/{numPairs}</span>
                </div>
                <div className="bg-card/50 dark:bg-zinc-800/30 border border-border p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <SimpleCircularProgress progress={(timeLeft / GAME_DURATION) * 100} size={80} strokeWidth={6}>
                    <Timer className="h-6 w-6 text-primary" />
                  </SimpleCircularProgress>
                  <span className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">TIEMPO</span>
                  <span className="text-2xl font-bold text-foreground">{timeLeft}s</span>
                </div>
              </div>
              
              <div className="bg-card/50 dark:bg-zinc-800/30 border border-border p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Mejor Tiempo</span>
                    <span className="text-lg font-bold text-foreground">{bestTime !== null ? `${bestTime}s` : '-'}</span>
                  </div>
                </div>
              </div>
              
              <div className={cn(
                "bg-card/50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-dashed transition-colors",
                gameState === 'won' ? "border-green-500/50" : "border-primary/20"
              )}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                    gameState === 'won' ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                  )}>
                    {gameState === 'won' ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <h3 className={cn(
                    "font-bold transition-colors",
                    gameState === 'won' ? "text-green-600 dark:text-green-400" : "text-foreground"
                  )}>
                    {gameState === 'won' ? 'Pista 4: Desbloqueada' : 'Pista 4: Bloqueada'}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground italic pl-11 mb-4">
                  "Los recuerdos correctos ordenan la mente y abren el camino."
                </p>
                <div className="pl-11">
                    <div className="flex justify-between items-center text-xs font-medium text-muted-foreground mb-1">
                        <p>{gameState === 'won' ? 'DESBLOQUEADO' : 'PROGRESO'}</p>
                        <p>{Math.round(hintProgress)}%</p>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full">
                        <div className={cn("h-full rounded-full", gameState === 'won' ? "bg-green-500" : "bg-primary")} style={{ width: `${hintProgress}%` }} />
                    </div>
                </div>
              </div>
              
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex gap-2 items-center text-xs font-medium text-primary">
                      <Info className="h-4 w-4 shrink-0"/>
                      Encuentra todos los pares de cartas antes de que se acabe el tiempo.
                  </div>
              </div>
          </div>
        </div>
        
      </div>

      <Dialog open={isInstructionsOpen} onOpenChange={setInstructionsOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle className="text-2xl text-center font-bold">Instrucciones: Memoria de Recuerdos</DialogTitle>
                  <DialogDescription asChild>
                      <div className="text-center pt-4 space-y-4 text-base text-muted-foreground">
                          <p>Voltea las cartas para encontrar los {numPairs} pares que representan nuestros recuerdos compartidos.</p>
                          <p className="font-bold text-primary italic">El objetivo es encontrar todos los pares antes de que el tiempo se agote.</p>
                      </div>
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter className="pt-4">
                  <Button onClick={startGame} className="w-full h-12 text-lg font-bold">¡Comenzar!</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setMapModalOpen(false)}
        onNextChallenge={handleOpenKeywordModal}
        coordinates={coordinates}
        googleMapsUrl={googleMapsUrl}
        iframeUrl={iframeUrl}
        title="¡Cuarta Pista Desbloqueada!"
        description={
          <>
            <p>¡Ya casi terminas! Así que es tiempo de un merecido descanso y desayuno.</p>
            <p>Mmm... ¿qué sería bueno? ¡Ya sé! ¿Qué te parece un desayuno especial? Ve al <strong>Hotel Manadia</strong> donde tienen un pedido a tu nombre. Así que a descansar y a desayunar.</p>
            <p className="font-bold text-primary mt-2">¡Provechito! 🍽️</p>
          </>
        }
      />

      <KeywordModal
        isOpen={isKeywordModalOpen}
        onSuccess={handleKeywordSuccess}
        onBack={handleReturnToMap}
        correctKeyword={CORRECT_KEYWORD}
        title="Cuarta Palabra Clave"
        description="Has encontrado la cuarta pista. Ingresa la palabra clave para desbloquear el desafío final."
      />
    </>
  );
}
