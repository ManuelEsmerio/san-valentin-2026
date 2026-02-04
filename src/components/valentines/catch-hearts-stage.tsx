'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Trophy, Clock, XCircle, CheckCircle2, Gamepad2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';
import SimpleCircularProgress from './SimpleCircularProgress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// --- Game Constants ---
const GAME_DURATION = 30; // Shorter game
const TARGET_SCORE = 250; // Adjusted target
const CATCHER_WIDTH = 100;
const CATCHER_HEIGHT = 20;
const HIGH_SCORE_KEY = 'valentines-catch-highscore';

type ItemType = 'heart' | 'flower' | 'chocolate' | 'letter' | 'gift' | 'broken_heart' | 'trash';
type GameState = 'idle' | 'playing' | 'won' | 'lost';

type Item = {
  id: number;
  x: number;
  y: number;
  speed: number;
  type: ItemType;
  icon: string;
  points: number;
};

// --- Item Configuration (Simplified) ---
const ITEM_CONFIG: Record<ItemType, { icon: string; points: number }> = {
  heart: { icon: '❤️', points: 10 },
  flower: { icon: '🌹', points: 15 },
  chocolate: { icon: '🍫', points: 20 },
  letter: { icon: '💌', points: 25 },
  gift: { icon: '🎁', points: 30 },
  broken_heart: { icon: '💔', points: -15 },
  trash: { icon: '🗑️', points: -10 },
};

const drawItemOnCanvas = (ctx: CanvasRenderingContext2D, item: Item) => {
    ctx.font = '30px Arial';
    ctx.fillText(item.icon, item.x - 15, item.y + 15);
};

// --- Game Overlays ---
const GameOverlay = ({ status, onStart, onRetry, score, highScore }: { status: GameState; onStart: () => void; onRetry: () => void; score: number, highScore: number }) => {
  if (status === 'playing' || status === 'idle') return null;

  const isWon = status === 'won';
  const Icon = isWon ? CheckCircle2 : XCircle;
  const title = isWon ? '¡Lo lograste!' : '¡Se acabó el tiempo!';
  const buttonText = isWon ? 'Siguiente Desafío' : 'Reintentar';

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-10 animate-fade-in">
      <div className="bg-card p-8 rounded-2xl shadow-2xl max-w-sm w-full">
        <Icon className={cn("h-16 w-16 mx-auto mb-4", isWon ? "text-green-500" : "text-destructive")} />
        <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-1">Tu puntaje: <span className="font-bold text-foreground">{score}</span></p>
        <p className="text-muted-foreground mb-6">Récord: <span className="font-bold text-foreground">{highScore}</span></p>
        <Button onClick={isWon ? onStart : onRetry} className="w-full h-12 text-lg font-bold">
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function CatchHeartsStage({ onSuccess }: { onSuccess: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [highScore, setHighScore] = useState(0);
  const [isInstructionsModalOpen, setInstructionsModalOpen] = useState(false);

  const gameLoopRef = useRef<number>();
  const itemsRef = useRef<Item[]>([]);
  const catcherXRef = useRef(0);
  const nextItemIdRef = useRef(0);
  const lastSpawnTimeRef = useRef(0);

  useEffect(() => {
    try {
      const storedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
      if (storedHighScore) {
        setHighScore(parseInt(storedHighScore, 10));
      }
    } catch (error) {
      console.error("Could not access localStorage for high score.");
    }
  }, []);

  const updateHighScore = useCallback((newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      try {
        localStorage.setItem(HIGH_SCORE_KEY, newScore.toString());
      } catch (error) {
        console.error("Could not save high score to localStorage.");
      }
    }
  }, [highScore]);

  const resetGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    itemsRef.current = [];
    nextItemIdRef.current = 0;
    if (canvasRef.current) {
        catcherXRef.current = canvasRef.current.width / 2;
    }
  }, []);

  const startGame = () => {
    setInstructionsModalOpen(false);
    resetGame();
    setGameState('playing');
  };

  const handleGameEnd = useCallback((finalScore: number) => {
    updateHighScore(finalScore);
    if (finalScore >= TARGET_SCORE) {
      setGameState('won');
    } else {
      setGameState('lost');
    }
  }, [updateHighScore]);

  const getRandomItemType = (currentScore: number): ItemType => {
      // Progressive difficulty: negative items become more common as score increases
      const negativeItemChance = Math.min(0.4, 0.20 + (currentScore / TARGET_SCORE) * 0.2);
      const rand = Math.random();

      const positiveItems = (Object.keys(ITEM_CONFIG) as ItemType[]).filter(k => ITEM_CONFIG[k].points > 0);
      const negativeItems = (Object.keys(ITEM_CONFIG) as ItemType[]).filter(k => ITEM_CONFIG[k].points < 0);

      if (rand > negativeItemChance) {
        return positiveItems[Math.floor(Math.random() * positiveItems.length)];
      } else {
        return negativeItems[Math.floor(Math.random() * negativeItems.length)];
      }
  };
  
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          handleGameEnd(score);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [gameState, score, handleGameEnd]);

  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    catcherXRef.current = rect.width / 2;

    const gameLoop = (timestamp: number) => {
      if (gameState !== 'playing') return;

      const baseSpeed = 2 + (score / 100);
      const spawnInterval = Math.max(200, 500 - (score / 10));

      if (timestamp - lastSpawnTimeRef.current > spawnInterval) { 
        lastSpawnTimeRef.current = timestamp;
        const type = getRandomItemType(score);
        const config = ITEM_CONFIG[type];
        itemsRef.current.push({
          id: nextItemIdRef.current++,
          x: Math.random() * rect.width,
          y: -30,
          speed: baseSpeed + Math.random() * 2,
          type,
          icon: config.icon,
          points: config.points,
        });
      }

      ctx.clearRect(0, 0, rect.width, rect.height);

      itemsRef.current = itemsRef.current.filter(item => {
        item.y += item.speed;
        
        const catcherLeft = catcherXRef.current - CATCHER_WIDTH / 2;
        const catcherRight = catcherXRef.current + CATCHER_WIDTH / 2;
        if (item.y + 30 >= rect.height - CATCHER_HEIGHT && item.y <= rect.height && item.x >= catcherLeft && item.x <= catcherRight) {
            setScore(s => Math.max(0, s + item.points));
            return false;
        }
        
        if (item.y < rect.height + 50) {
            drawItemOnCanvas(ctx, item);
            return true;
        }
        return false;
      });

      ctx.fillStyle = 'hsl(var(--primary) / 0.7)';
      ctx.beginPath();
      ctx.roundRect(catcherXRef.current - CATCHER_WIDTH / 2, rect.height - CATCHER_HEIGHT, CATCHER_WIDTH, CATCHER_HEIGHT, [10, 10, 0, 0]);
      ctx.fill();

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    const handleMouseMove = (e: MouseEvent) => catcherXRef.current = e.clientX - canvas.getBoundingClientRect().left;
    const handleTouchMove = (e: TouchEvent) => { e.preventDefault(); catcherXRef.current = e.touches[0].clientX - canvas.getBoundingClientRect().left; };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [gameState, score]);

  const totalChallenges = 5;
  const completedChallenges = 1;
  const overallProgress = (completedChallenges / totalChallenges) * 100;

  return (
    <>
      <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
        <header className="w-full flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-1">Desafío 02</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Atrapa los <span className="text-primary italic">Detalles</span>
            </h1>
          </div>
          <div className="bg-card/50 dark:bg-zinc-800/30 rounded-2xl p-5 w-full md:w-96 border border-border">
            <div className="flex justify-between items-end mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Progreso Total</span>
              <span className="text-primary font-bold italic">{completedChallenges} de {totalChallenges} Completados</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </header>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="relative overflow-hidden aspect-square flex flex-col items-center justify-center gap-6 rounded-2xl bg-card/80 p-2 border-2 border-primary/10">
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:30px_30px]"></div>

              {gameState === 'idle' && (
                <div className="flex flex-col items-center gap-4 z-10 text-center animate-fade-in p-8">
                  <div className="relative bg-background w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg border border-primary/10">
                    <Gamepad2 className="text-primary h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground pt-4">Atrapa los Detalles</h3>
                  <p className="max-w-xs text-muted-foreground">Para seguir avanzando, debes de completar este desafío.</p>
                  <Button onClick={() => setInstructionsModalOpen(true)} className="mt-6 h-12 px-8 rounded-xl text-base font-bold tracking-wider shadow-lg shadow-primary/20" size="lg">
                    Empezar Desafío
                  </Button>
                </div>
              )}

              {(gameState === "playing" || gameState === "won" || gameState === "lost") && (
                <canvas ref={canvasRef} className={cn(
                  "rounded-lg bg-pink-100/20 dark:bg-pink-900/10 transition-opacity duration-500 w-full h-full",
                  (gameState === "lost" || gameState === "won") && "opacity-10"
                )} />
              )}
              <GameOverlay status={gameState} onStart={onSuccess} onRetry={startGame} score={score} highScore={highScore} />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card/50 dark:bg-zinc-800/30 border border-border p-4 rounded-3xl flex flex-col items-center justify-center text-center">
                <SimpleCircularProgress progress={(score / TARGET_SCORE) * 100} size={80} strokeWidth={8}>
                  <Heart className="h-6 w-6 text-primary" />
                </SimpleCircularProgress>
                <span className="mt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Puntaje</span>
                <span className="text-2xl font-bold text-foreground">{score}</span>
              </div>
              <div className="bg-card/50 dark:bg-zinc-800/30 border border-border p-4 rounded-3xl flex flex-col items-center justify-center text-center">
                <SimpleCircularProgress progress={(timeLeft / GAME_DURATION) * 100} size={80} strokeWidth={8}>
                  <Clock className="h-6 w-6 text-primary" />
                </SimpleCircularProgress>
                <span className="mt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Tiempo</span>
                <span className="text-2xl font-bold text-foreground">{timeLeft}s</span>
              </div>
            </div>

            <div className="bg-card/50 dark:bg-zinc-800/30 border border-border p-5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Mejor Récord</span>
                  <span className="text-lg font-bold text-foreground">{highScore} Puntos</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="flex gap-2 items-center text-xs font-medium text-primary">
                    <Info className="h-4 w-4 shrink-0"/>
                    Usa el mouse o tu dedo para guiar la cesta.
                </div>
            </div>

          </div>
        </div>
      </div>
      
      <Dialog open={isInstructionsModalOpen} onOpenChange={setInstructionsModalOpen}>
          <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                  <DialogTitle className="text-2xl text-center font-bold">Desafío 2: Atrapa los Detalles</DialogTitle>
                   <DialogDescription asChild>
                      <div className="text-center pt-4 space-y-6 text-base text-muted-foreground">
                        <p>Usa el ratón o tu dedo para mover la cesta y atrapar los objetos buenos. ¡Evita los malos!</p>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-left w-fit mx-auto">
                            <p className="font-medium flex items-center gap-2">❤️ Corazones: <span className="font-bold text-foreground">+10</span></p>
                            <p className="font-medium flex items-center gap-2">🌹 Flores: <span className="font-bold text-foreground">+15</span></p>
                            <p className="font-medium flex items-center gap-2">🍫 Chocolates: <span className="font-bold text-foreground">+20</span></p>
                            <p className="font-medium flex items-center gap-2">💌 Cartas: <span className="font-bold text-foreground">+25</span></p>
                            <p className="font-medium flex items-center gap-2">🎁 Regalos: <span className="font-bold text-foreground">+30</span></p>
                            <p className="font-medium flex items-center gap-2 text-destructive">💔 Corazón roto: <span className="font-bold text-destructive">-15</span></p>
                            <p className="font-medium flex items-center gap-2 text-destructive">🗑️ Basura: <span className="font-bold text-destructive">-10</span></p>
                        </div>
                        <p>Alcanza <span className="font-bold text-primary">{TARGET_SCORE}</span> puntos en {GAME_DURATION} segundos para ganar.</p>
                      </div>
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter className="pt-4">
                  <Button onClick={startGame} className="w-full h-12 text-lg font-bold">¡Vamos!</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
