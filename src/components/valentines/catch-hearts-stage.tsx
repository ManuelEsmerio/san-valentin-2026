'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Play, Trophy, Clock, XCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import SimpleCircularProgress from './SimpleCircularProgress';

// --- Game Constants ---
const GAME_DURATION = 30; // in seconds
const TARGET_SCORE = 25;
const CATCHER_WIDTH = 100;
const CATCHER_HEIGHT = 20;
const HEART_SIZE = 30;

type GameState = 'idle' | 'playing' | 'won' | 'lost';
type HeartObject = {
  id: number;
  x: number;
  y: number;
  speed: number;
};

// Reusable heart drawing function
const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    const topCurveHeight = height * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2, x, y + (height + topCurveHeight) / 2, x, y + height);
    ctx.bezierCurveTo(x, y + (height + topCurveHeight) / 2, x + width / 2, y + (height + topCurveHeight) / 2, x + width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
};

const GameOverlay = ({ status, onStart, onRetry, score }: { status: GameState; onStart: () => void; onRetry: () => void; score: number }) => {
  if (status === 'playing' || status === 'idle') return null;

  const isWon = status === 'won';
  const Icon = isWon ? CheckCircle2 : XCircle;
  const title = isWon ? '¡Lo lograste!' : '¡Se acabó el tiempo!';
  const description = isWon 
    ? `Atrapaste ${score} corazones. ¡Excelente trabajo!`
    : `Atrapaste ${score} de ${TARGET_SCORE}. ¡Inténtalo de nuevo!`;
  const buttonText = isWon ? 'Siguiente Desafío' : 'Reintentar';

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-10 animate-fade-in">
      <div className="bg-card p-8 rounded-2xl shadow-2xl max-w-sm w-full">
        <Icon className={cn("h-16 w-16 mx-auto mb-4", isWon ? "text-green-500" : "text-destructive")} />
        <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        <Button onClick={isWon ? onStart : onRetry} className="w-full h-12 text-lg font-bold">
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default function CatchHeartsStage({ onSuccess }: { onSuccess: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

  const gameLoopRef = useRef<number>();
  const heartsRef = useRef<HeartObject[]>([]);
  const catcherXRef = useRef(0);
  const nextHeartIdRef = useRef(0);
  const lastSpawnTimeRef = useRef(0);

  const resetGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    heartsRef.current = [];
    nextHeartIdRef.current = 0;
    if (canvasRef.current) {
        catcherXRef.current = canvasRef.current.width / 2;
    }
  }, []);

  const startGame = () => {
    resetGame();
    setGameState('playing');
  };

  const handleGameEnd = useCallback((finalScore: number) => {
    if (finalScore >= TARGET_SCORE) {
      setGameState('won');
    } else {
      setGameState('lost');
    }
  }, []);

  // Timer effect
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

  // Main Game Loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
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

      if (timestamp - lastSpawnTimeRef.current > 500) { 
        lastSpawnTimeRef.current = timestamp;
        heartsRef.current.push({
          id: nextHeartIdRef.current++,
          x: Math.random() * rect.width,
          y: -HEART_SIZE,
          speed: 2 + Math.random() * 2,
        });
      }

      ctx.clearRect(0, 0, rect.width, rect.height);

      heartsRef.current = heartsRef.current.filter(heart => {
        heart.y += heart.speed;
        
        const catcherLeft = catcherXRef.current - CATCHER_WIDTH / 2;
        const catcherRight = catcherXRef.current + CATCHER_WIDTH / 2;
        if (
          heart.y + HEART_SIZE >= rect.height - CATCHER_HEIGHT &&
          heart.y <= rect.height &&
          heart.x >= catcherLeft &&
          heart.x <= catcherRight
        ) {
          setScore(prev => prev + 1);
          return false;
        }
        
        if (heart.y < rect.height) {
            drawHeart(ctx, heart.x, heart.y, HEART_SIZE, HEART_SIZE, 'hsl(var(--primary))');
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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      catcherXRef.current = e.clientX - rect.left;
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      catcherXRef.current = e.touches[0].clientX - rect.left;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [gameState]);


  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="w-full relative bg-card/80 rounded-2xl aspect-[9/12] max-h-[70vh] shadow-lg border border-primary/10 overflow-hidden">
        
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10 animate-fade-in">
              <div className="relative bg-background w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg border border-primary/10 mb-6">
                <Heart className="text-primary h-10 w-10"/>
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                  Atrapa los Corazones
              </h3>
              <p className="max-w-xs text-muted-foreground mt-2 mb-6">
                  ¡Rápido! Atrapa {TARGET_SCORE} corazones en {GAME_DURATION} segundos para continuar tu aventura.
              </p>
              <Button onClick={startGame} className="h-12 px-8 rounded-xl text-base font-bold tracking-wider shadow-lg shadow-primary/20">
                  <Play className="mr-2 h-5 w-5"/>
                  Jugar ahora
              </Button>
          </div>
        )}

        <canvas ref={canvasRef} className="w-full h-full" />
        
        <GameOverlay 
            status={gameState} 
            onStart={onSuccess} 
            onRetry={startGame}
            score={score}
        />

        {gameState === 'playing' && (
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center gap-4 z-20">
              <div className="bg-card/50 backdrop-blur-sm p-2 pl-4 rounded-full flex items-center gap-3 border border-border">
                  <Heart className="h-6 w-6 text-primary" fill="hsl(var(--primary))"/>
                  <span className="text-2xl font-bold text-foreground w-12 text-center">{score}</span>
              </div>
              <div className="bg-card/50 backdrop-blur-sm p-2 pr-4 rounded-full flex items-center gap-3 border border-border">
                   <span className="text-2xl font-bold text-foreground w-12 text-center">{timeLeft}s</span>
                   <Clock className="h-6 w-6 text-primary"/>
              </div>
          </div>
        )}
      </div>

       <div className="w-full bg-card/50 dark:bg-zinc-800/30 p-5 rounded-2xl flex items-center justify-between border border-border">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Trophy className="w-6 h-6"/>
              </div>
              <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Meta</span>
                  <span className="text-lg font-bold text-foreground">{TARGET_SCORE} Corazones</span>
              </div>
          </div>
          <SimpleCircularProgress progress={(score / TARGET_SCORE) * 100} size={50} strokeWidth={5}>
            <span className="text-xs font-bold">{Math.round((score / TARGET_SCORE) * 100)}%</span>
          </SimpleCircularProgress>
      </div>

    </div>
  );
}
