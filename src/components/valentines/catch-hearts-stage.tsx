
'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Clock, Info, Gamepad2, Lock, LockOpen, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import SimpleCircularProgress from './SimpleCircularProgress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MapModal from './MapModal';
import KeywordModal from './KeywordModal';

// --- Game Constants ---
const GAME_DURATION = 30;
const CATCHER_WIDTH = 100;
const CATCHER_HEIGHT = 20;
const HIGH_SCORE_KEY = 'valentines-catch-highscore';
const GAME_STATS_KEY = 'valentines-catch-stats';

type ItemType = 'heart' | 'flower' | 'chocolate' | 'letter' | 'gift' | 'broken_heart' | 'trash';
type GameState = 'idle' | 'playing' | 'won' | 'lost';

type CatchHeartsStageProps = {
  onGameWon?: () => void;
  onAdvance?: () => void;
  user: string | null;
  initialGameState?: GameState;
};

type Item = {
  id: number;
  x: number;
  y: number;
  speed: number;
  type: ItemType;
  icon: string;
  points: number;
};

// --- Item Configuration ---
const ITEM_CONFIG: Record<ItemType, { icon: string; points: number }> = {
  heart: { icon: '❤️', points: 10 },
  flower: { icon: '🌹', points: 15 },
  chocolate: { icon: '🍫', points: 20 },
  letter: { icon: '💌', points: 25 },
  gift: { icon: '🎁', points: 30 },
  broken_heart: { icon: '💔', points: -15 },
  trash: { icon: '🗑️', points: -10 },
};

const itemTypes = Object.keys(ITEM_CONFIG) as ItemType[];
const positiveItems = itemTypes.filter(k => ITEM_CONFIG[k].points > 0);
const negativeItems = itemTypes.filter(k => ITEM_CONFIG[k].points < 0);

const drawItemOnCanvas = (ctx: CanvasRenderingContext2D, item: Item) => {
    ctx.font = '30px Arial';
    ctx.fillText(item.icon, item.x - 15, item.y + 15);
};

// --- Game Overlays ---
const GameOverlay = ({ status, onStart, onRetry, score, highScore }: { status: GameState; onStart: () => void; onRetry: () => void; score: number, highScore: number }) => {
  if (status !== 'won' && status !== 'lost') return null;

  const isWon = status === 'won';
  const Icon = isWon ? 'auto_awesome' : 'replay';
  const title = isWon ? '¡Lo lograste!' : '¡Se acabó el tiempo!';
  const buttonText = isWon ? 'Ver Siguiente Pista' : 'Reintentar';

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-10 animate-fade-in">
      <div className="bg-card p-8 rounded-2xl shadow-2xl max-w-sm w-full">
        <div className={cn("h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center", isWon ? "bg-green-100 dark:bg-green-900/30" : "bg-primary/10")}>
            <span className="material-symbols-rounded text-4xl" style={{color: isWon ? 'hsl(var(--chart-2))' : 'hsl(var(--primary))'}}>{Icon}</span>
        </div>
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
export default function CatchHeartsStage({ onGameWon, onAdvance, user, initialGameState = 'idle' }: CatchHeartsStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [highScore, setHighScore] = useState(0);
  const [isInstructionsModalOpen, setInstructionsModalOpen] = useState(false);
  const [isMapModalOpen, setMapModalOpen] = useState(false);
  const [isKeywordModalOpen, setKeywordModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const isDevMode = user === 'manuel';
  const TARGET_SCORE = useMemo(() => isDevMode ? 100 : 300, [isDevMode]);
  
  const coordinates = "20.8819782° N, -103.8356295° W";
  const lat = "20.8819782";
  const long = "-103.8356295";
  const googleMapsUrl = `https://maps.app.goo.gl/kK32LgfJWQNtBKzp7`;
  const iframeUrl = `https://maps.google.com/maps?q=${lat},${long}&hl=es&z=14&output=embed`;

  const scoreRef = useRef(score);
  const itemsRef = useRef<Item[]>([]);
  const catcherXRef = useRef(0);
  const nextItemIdRef = useRef(0);
  const lastSpawnTimeRef = useRef(0);
  const animationFrameIdRef = useRef<number>();

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  
  useEffect(() => {
    setIsClient(true);
    try {
      const storedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
      if (storedHighScore) {
        setHighScore(parseInt(storedHighScore, 10));
      }
      if (initialGameState === 'won') {
        const stats = localStorage.getItem(GAME_STATS_KEY);
        if (stats) {
          setFinalScore(JSON.parse(stats).score);
        }
      }
    } catch (error) {
      console.error("Could not access localStorage for high score.");
    }
  }, [initialGameState]);

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
        catcherXRef.current = canvasRef.current.getBoundingClientRect().width / 2;
    }
  }, []);

  const startGame = () => {
    setInstructionsModalOpen(false);
    resetGame();
    setGameState('playing');
  };

  const handleGameEnd = useCallback(() => {
    const scoreValue = scoreRef.current;
    updateHighScore(scoreValue);
    setFinalScore(scoreValue);
    if (scoreValue >= TARGET_SCORE) {
      setGameState('won');
    } else {
      setGameState('lost');
    }
  }, [updateHighScore, TARGET_SCORE]);
  
  useEffect(() => {
    if (gameState === 'won' && initialGameState !== 'won') {
      if (isClient) {
        try {
          localStorage.setItem(GAME_STATS_KEY, JSON.stringify({ score: finalScore }));
        } catch (e) {}
      }
      onGameWon?.();
    }
  }, [gameState, initialGameState, onGameWon, isClient, finalScore]);

  const handleWin = useCallback(() => {
    setMapModalOpen(true);
  }, []);

  const handleOpenKeywordModal = useCallback(() => {
    setMapModalOpen(false);
    setKeywordModalOpen(true);
  }, []);
  
  const handleReturnToMap = useCallback(() => {
    setKeywordModalOpen(false);
    setMapModalOpen(true);
  }, []);

  const handleKeywordSuccess = useCallback(() => {
    setKeywordModalOpen(false);
    onAdvance?.();
  }, [onAdvance]);


  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (gameState === 'playing') {
      timerId = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            handleGameEnd();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [gameState, handleGameEnd]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    
    const gameLoop = (timestamp: number) => {
      if (gameState !== 'playing') return;
      const currentScore = scoreRef.current;
      const baseSpeed = 2 + (currentScore / 100);
      const spawnInterval = Math.max(200, 500 - (currentScore / 10));

      if (timestamp - lastSpawnTimeRef.current > spawnInterval) { 
        lastSpawnTimeRef.current = timestamp;
        const type = getRandomItemType();
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

      const newItems: Item[] = [];
      for (const item of itemsRef.current) {
          item.y += item.speed;
      
          const catcherLeft = catcherXRef.current - CATCHER_WIDTH / 2;
          const catcherRight = catcherXRef.current + CATCHER_WIDTH / 2;
          if (item.y + 30 >= rect.height - CATCHER_HEIGHT && item.y <= rect.height && item.x >= catcherLeft && item.x <= catcherRight) {
              setScore(s => Math.max(0, s + item.points));
          } else if (item.y < rect.height + 50) {
              newItems.push(item);
          }
      }
      itemsRef.current = newItems;

      itemsRef.current.forEach(item => drawItemOnCanvas(ctx, item));

      ctx.fillStyle = 'hsl(var(--primary) / 0.7)';
      ctx.beginPath();
      ctx.roundRect(catcherXRef.current - CATCHER_WIDTH / 2, rect.height - CATCHER_HEIGHT, CATCHER_WIDTH, CATCHER_HEIGHT, [10, 10, 0, 0]);
      ctx.fill();

      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState === 'playing') {
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      if(!canvasRef.current) return;
      catcherXRef.current = e.clientX - canvasRef.current.getBoundingClientRect().left;
    }
    const handleTouchMove = (e: TouchEvent) => { 
        if(!canvasRef.current) return;
        e.preventDefault(); 
        catcherXRef.current = e.touches[0].clientX - canvasRef.current.getBoundingClientRect().left; 
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [gameState]);


  const getRandomItemType = (): ItemType => {
      const currentScore = scoreRef.current;
      const negativeItemChance = Math.min(0.4, 0.20 + (currentScore / TARGET_SCORE) * 0.2);
      const rand = Math.random();

      if (rand > negativeItemChance) {
        return positiveItems[Math.floor(Math.random() * positiveItems.length)];
      } else {
        return negativeItems[Math.floor(Math.random() * negativeItems.length)];
      }
  };

  const hintProgress = (score / TARGET_SCORE) * 100;

  return (
    <>
      <div className="w-full relative">
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 relative">
              <div className="relative overflow-hidden aspect-square flex flex-col items-center justify-center gap-6 rounded-2xl bg-card p-0 border-2 border-primary/10">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:30px_30px]"></div>

                {gameState === 'idle' && (
                  <div className="flex flex-col items-center gap-4 z-10 text-center animate-fade-in p-8">
                    <div className="relative bg-background w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border border-primary/10">
                      <Gamepad2 className="text-primary h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground pt-4">Atrapa los Detalles</h3>
                    <p className="max-w-xs text-muted-foreground">Para seguir avanzando, debes de completar este desafío.</p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                      <Button onClick={() => setInstructionsModalOpen(true)} className="w-full sm:w-auto h-12 px-8 rounded-lg text-base font-bold tracking-wider shadow-lg shadow-primary/20" size="lg">
                        Empezar Desafío
                      </Button>
                      {isDevMode && (
                          <Button onClick={onGameWon} variant="outline" className="w-full sm:w-auto h-12">
                              Saltar Desafío (Dev)
                          </Button>
                      )}
                    </div>
                  </div>
                )}

                {(gameState === "playing" || gameState === "won" || gameState === "lost") && (
                  <canvas ref={canvasRef} className={cn(
                    "rounded-lg bg-pink-100/20 dark:bg-pink-900/10 transition-opacity duration-500 w-full h-full",
                    (gameState === "lost" || gameState === "won") && "opacity-10"
                  )} />
                )}
              </div>
              <GameOverlay status={gameState} onStart={handleWin} onRetry={startGame} score={finalScore} highScore={highScore} />
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card/50 dark:bg-zinc-800/30 border border-border p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <SimpleCircularProgress progress={(score / TARGET_SCORE) * 100} size={80} strokeWidth={6}>
                    <Heart className="h-6 w-6 text-primary" />
                  </SimpleCircularProgress>
                  <span className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Puntaje</span>
                  <span className="text-2xl font-bold text-foreground">{score}</span>
                </div>
                <div className="bg-card/50 dark:bg-zinc-800/30 border border-border p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <SimpleCircularProgress progress={(timeLeft / GAME_DURATION) * 100} size={80} strokeWidth={6}>
                    <Clock className="h-6 w-6 text-primary" />
                  </SimpleCircularProgress>
                  <span className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Tiempo</span>
                  <span className="text-2xl font-bold text-foreground">{timeLeft}s</span>
                </div>
              </div>

              <div className="bg-card/50 dark:bg-zinc-800/30 border border-border p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-rounded text-2xl">military_tech</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Mejor Récord</span>
                    <span className="text-lg font-bold text-foreground">{highScore} Puntos</span>
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
                    {gameState === 'won' ? 'Pista Desbloqueada' : 'Pista Bloqueada'}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground italic pl-11 mb-4">
                  "En esta lluvia de detalles, solo lo valioso merece ser atrapado. Elige con el corazón."
                </p>
                <div className="pl-11">
                    <div className="flex justify-between items-center text-xs font-medium text-muted-foreground mb-1">
                        <p>{gameState === 'won' ? 'DESBLOQUEADO' : 'PROGRESO'}</p>
                        <p>{Math.min(100, Math.round(hintProgress))}%</p>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full">
                        <div className={cn("h-full rounded-full", gameState === 'won' ? "bg-green-500" : "bg-primary")} style={{ width: `${Math.min(100, hintProgress)}%` }} />
                    </div>
                </div>
              </div>
              
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex gap-2 items-center text-xs font-medium text-primary">
                      <Info className="h-4 w-4 shrink-0"/>
                      Usa el mouse o tu dedo para guiar la cesta.
                  </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      <Dialog open={isInstructionsModalOpen} onOpenChange={setInstructionsModalOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle className="text-2xl text-center font-bold">Desafío 2: Atrapa los Detalles</DialogTitle>
                   <DialogDescription asChild>
                      <div className="text-center pt-4 space-y-6 text-base text-muted-foreground">
                        <p>Usa el ratón o tu dedo para mover la cesta y atrapar los objetos buenos. ¡Evita los malos!</p>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-left w-fit mx-auto">
                            {positiveItems.map(key => (
                                <p key={key} className="font-medium flex items-center gap-2">{ITEM_CONFIG[key].icon} {key.replace('_', ' ')}: <span className="font-bold text-foreground">{ITEM_CONFIG[key].points > 0 ? '+' : ''}{ITEM_CONFIG[key].points}</span></p>
                            ))}
                            {negativeItems.map(key => (
                                <p key={key} className="font-medium flex items-center gap-2 text-destructive">{ITEM_CONFIG[key].icon} {key.replace('_', ' ')}: <span className="font-bold">{ITEM_CONFIG[key].points}</span></p>
                            ))}
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

      <MapModal 
        isOpen={isMapModalOpen}
        onClose={() => setMapModalOpen(false)}
        onNextChallenge={handleOpenKeywordModal}
        coordinates={coordinates}
        googleMapsUrl={googleMapsUrl}
        iframeUrl={iframeUrl}
        title="¡Segunda Pista Desbloqueada!"
        description={
          <>
            <p>¡Felicidades! 🎉💖<br/>Has superado el segundo desafío… y eso merece una pausa para recargar energía. ✨</p>
            <p>¿Qué te parece un delicioso chocomilk y una palabra especial para continuar? 🥛💕<br/>Te prometo que te va a encantar. 😘</p>
            <div className="text-left text-sm border-t border-border pt-4 mt-4">
                <p className="mt-4">La siguiente pista te espera en la lonchería de mi madrina.<br/>Ve a recoger un pedido a nombre de:</p>
                <p className="font-bold text-center text-base sm:text-lg text-primary bg-primary/10 py-3 px-4 rounded-lg mt-2">Mariana Rangel 💝</p>
                <p className="mt-4">Y si te preguntan, también puedes decir que vas por el pedido de:</p>
                <p className="font-bold text-center text-base sm:text-lg text-foreground bg-muted/50 py-3 px-4 rounded-lg mt-2">“Güero” 😏❤️</p>
            </div>
          </>
        }
      />

      <KeywordModal
        isOpen={isKeywordModalOpen}
        onSuccess={handleKeywordSuccess}
        onBack={handleReturnToMap}
        correctKeyword="A mi"
        title="Segunda Palabra Clave"
        description="Has encontrado la segunda pista. Ingresa la palabra clave para desbloquear el siguiente desafío."
      />
    </>
  );
}

    