'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Play, Trophy, Clock, XCircle, CheckCircle2, Star, Shield, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

// --- Game Constants ---
const GAME_DURATION = 60;
const TARGET_SCORE = 300;
const CATCHER_WIDTH = 100;
const CATCHER_HEIGHT = 20;
const STAR_POWERUP_DURATION = 5000; // 5 seconds
const HIGH_SCORE_KEY = 'valentines-catch-highscore';

type ItemType = 'heart' | 'flower' | 'chocolate' | 'letter' | 'gift' | 'broken_heart' | 'trash' | 'clock' | 'star' | 'diamond';
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

type PowerUps = {
  star: { active: boolean; timeoutId: NodeJS.Timeout | null };
  diamond: { active: boolean };
};

// --- Item Configuration ---
const ITEM_CONFIG: Record<ItemType, { icon: string; points: number; baseProb: number }> = {
  heart: { icon: '❤️', points: 10, baseProb: 0.35 },
  flower: { icon: '🌹', points: 15, baseProb: 0.15 },
  chocolate: { icon: '🍫', points: 20, baseProb: 0.10 },
  letter: { icon: '💌', points: 25, baseProb: 0.05 },
  gift: { icon: '🎁', points: 30, baseProb: 0.03 },
  broken_heart: { icon: '💔', points: -15, baseProb: 0.10 },
  trash: { icon: '🗑️', points: -10, baseProb: 0.12 },
  clock: { icon: '⏱️', points: 10, baseProb: 0.03 }, // Points are seconds
  star: { icon: '⭐', points: 0, baseProb: 0.04 },
  diamond: { icon: '💎', points: 0, baseProb: 0.03 },
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
  const description = isWon 
    ? `Alcanzaste ${score} puntos. ¡Excelente trabajo!`
    : `Obtuviste ${score} de ${TARGET_SCORE}. ¡Inténtalo de nuevo!`;
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

const Hud = ({ score, timeLeft, highScore, powerUps }: { score: number, timeLeft: number, highScore: number, powerUps: PowerUps }) => (
  <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-4 z-20">
    <div className="flex flex-col gap-2">
      <div className="bg-card/50 backdrop-blur-sm p-2 pl-4 rounded-full flex items-center gap-3 border border-border">
          <Heart className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground w-16 text-center">{score}</span>
      </div>
      <div className="bg-card/50 backdrop-blur-sm p-2 pl-4 rounded-full flex items-center gap-3 border border-border">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <span className="text-xl font-bold text-foreground w-16 text-center">{highScore}</span>
      </div>
    </div>
    <div className="flex flex-col gap-2 items-end">
      <div className="bg-card/50 backdrop-blur-sm p-2 pr-4 rounded-full flex items-center gap-3 border border-border">
          <span className="text-xl font-bold text-foreground w-12 text-center">{timeLeft}s</span>
          <Clock className="h-6 w-6 text-primary"/>
      </div>
      <div className="flex gap-2">
        {powerUps.star.active && <div className="h-8 w-8 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center border border-yellow-400/50 animate-pulse"><Star className="h-5 w-5" /></div>}
        {powerUps.diamond.active && <div className="h-8 w-8 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center border border-cyan-400/50"><Shield className="h-5 w-5" /></div>}
      </div>
    </div>
  </div>
);

// --- Main Component ---
export default function CatchHeartsStage({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [highScore, setHighScore] = useState(0);
  const [powerUps, setPowerUps] = useState<PowerUps>({ star: { active: false, timeoutId: null }, diamond: { active: false } });

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
    if (powerUps.star.timeoutId) clearTimeout(powerUps.star.timeoutId);
    setPowerUps({ star: { active: false, timeoutId: null }, diamond: { active: false } });
    if (canvasRef.current) {
        catcherXRef.current = canvasRef.current.width / 2;
    }
  }, [powerUps.star.timeoutId]);

  const startGame = () => {
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
      let positiveProb = 0.68;
      let negativeProb = 0.22;
      // Progressive difficulty
      if (currentScore > 150) {
        positiveProb = 0.58;
        negativeProb = 0.32;
      }
      if (currentScore > 300) {
        positiveProb = 0.48;
        negativeProb = 0.42;
      }
      
      const rand = Math.random();
      let cumulativeProb = 0;
      
      const positiveItems = (Object.keys(ITEM_CONFIG) as ItemType[]).filter(k => ITEM_CONFIG[k].points > 0 && k !== 'clock');
      const negativeItems = (Object.keys(ITEM_CONFIG) as ItemType[]).filter(k => ITEM_CONFIG[k].points < 0);
      const specialItems = (Object.keys(ITEM_CONFIG) as ItemType[]).filter(k => ITEM_CONFIG[k].points === 0 || k === 'clock');

      if (rand < positiveProb) {
          return positiveItems[Math.floor(Math.random() * positiveItems.length)];
      } else if (rand < positiveProb + negativeProb) {
          return negativeItems[Math.floor(Math.random() * negativeItems.length)];
      } else {
          return specialItems[Math.floor(Math.random() * specialItems.length)];
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
            
            // --- Item catch logic ---
            if (item.points < 0) { // Negative item
                if (powerUps.diamond.active) {
                    setPowerUps(p => ({ ...p, diamond: { active: false } }));
                    toast({ title: "¡Protegida!", description: "El diamante te ha salvado de los puntos negativos." });
                } else {
                    setScore(s => Math.max(0, s + item.points));
                }
            } else { // Positive or Special item
                 if (item.type === 'clock') {
                    setTimeLeft(t => t + item.points);
                    toast({ title: "¡Tiempo Extra!", description: `+${item.points} segundos añadidos.` });
                 } else if (item.type === 'star') {
                    if (powerUps.star.timeoutId) clearTimeout(powerUps.star.timeoutId);
                    const newTimeoutId = setTimeout(() => {
                        setPowerUps(p => ({...p, star: { active: false, timeoutId: null }}));
                        toast({ title: 'Poder Estelar Terminado', description: 'Los puntos vuelven a la normalidad.' });
                    }, STAR_POWERUP_DURATION);
                    setPowerUps(p => ({...p, star: { active: true, timeoutId: newTimeoutId }}));
                    toast({ title: "¡Poder Estelar!", description: "¡Puntos dobles por 5 segundos!" });
                 } else if (item.type === 'diamond') {
                    setPowerUps(p => ({...p, diamond: { active: true }}));
                    toast({ title: "¡Protección!", description: "Estás protegida del siguiente objeto negativo." });
                 } else { // Regular positive item
                    const pointsToAdd = powerUps.star.active ? item.points * 2 : item.points;
                    setScore(s => s + pointsToAdd);
                 }
            }
            return false; // Remove item
        }
        
        if (item.y < rect.height + 50) {
            drawItemOnCanvas(ctx, item);
            return true;
        }
        return false; // Item is off-screen
      });

      // Draw catcher
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
  }, [gameState, score, powerUps, toast]);

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="w-full relative bg-card/80 rounded-2xl aspect-[9/12] max-h-[70vh] shadow-lg border border-primary/10 overflow-hidden">
        
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10 animate-fade-in">
              <div className="relative bg-background w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg border border-primary/10 mb-6">
                <Heart className="text-primary h-10 w-10"/>
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                  Atrapa los Detalles del Amor
              </h3>
              <p className="max-w-xs text-muted-foreground mt-2 mb-6">
                  Atrapa los objetos buenos y evita los malos. ¡Alcanza <span className="font-bold text-primary">{TARGET_SCORE}</span> puntos en {GAME_DURATION} segundos!
              </p>
              <Button onClick={startGame} className="h-12 px-8 rounded-xl text-base font-bold tracking-wider shadow-lg shadow-primary/20">
                  <Play className="mr-2 h-5 w-5"/>
                  Jugar ahora
              </Button>
          </div>
        )}

        <canvas ref={canvasRef} className="w-full h-full" />
        
        <GameOverlay status={gameState} onStart={onSuccess} onRetry={startGame} score={score} highScore={highScore} />
        {gameState === 'playing' && <Hud score={score} timeLeft={timeLeft} highScore={highScore} powerUps={powerUps} />}
      </div>

       <div className="w-full bg-card/50 dark:bg-zinc-800/30 p-4 rounded-2xl flex items-center justify-between border border-border">
          <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Trophy className="w-7 h-7"/>
              </div>
              <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">Meta</span>
                  <span className="text-xl font-bold text-foreground">{TARGET_SCORE} Puntos</span>
              </div>
          </div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground"><HelpCircle /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Reglas del Juego</h4>
                            <p className="text-sm text-muted-foreground">
                                Atrapa los objetos buenos para sumar puntos y evita los malos para no perderlos. ¡Supera la meta de {TARGET_SCORE} puntos!
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                           <p className="text-sm font-medium flex items-center gap-2">❤️ +10</p>
                           <p className="text-sm font-medium flex items-center gap-2">🌹 +15</p>
                           <p className="text-sm font-medium flex items-center gap-2">🍫 +20</p>
                           <p className="text-sm font-medium flex items-center gap-2">💌 +25</p>
                           <p className="text-sm font-medium flex items-center gap-2">🎁 +30</p>
                           <p className="text-sm font-medium flex items-center gap-2">💔 -15</p>
                           <p className="text-sm font-medium flex items-center gap-2">🗑️ -10</p>
                           <p className="text-sm font-medium flex items-center gap-2">⏱️ +10s</p>
                           <p className="text-sm font-medium flex items-center gap-2">⭐ x2 Pts</p>
                           <p className="text-sm font-medium flex items-center gap-2">💎 Escudo</p>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
      </div>
    </div>
  );
}
