'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Lock, Trophy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Gamepad2, Info, LockOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import MapModal from "./MapModal";
import KeywordModal from "./KeywordModal";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SimpleCircularProgress from "./SimpleCircularProgress";

const GRID_SIZE = 20;
const CANVAS_SIZE = 800;
const TILE_SIZE = CANVAS_SIZE / GRID_SIZE;

type GameStageProps = {
  onSuccess: () => void;
  user: string | null;
};

type GameState = "idle" | "playing" | "won" | "lost";

const VictoryHearts = () => (
  <div className="relative mt-2 h-16 w-full pointer-events-none">
      <span style={{ animationDelay: '0.2s', fontVariationSettings: "'FILL' 1" }} className="material-symbols-outlined text-primary/60 absolute left-1/2 -translate-x-[2.5rem] top-2 text-xl animate-heart-celebrate">favorite</span>
      <span style={{ animationDelay: '0s', fontVariationSettings: "'FILL' 1" }} className="material-symbols-outlined text-primary/70 absolute left-1/2 -translate-x-1/2 text-2xl animate-heart-celebrate">favorite</span>
      <span style={{ animationDelay: '0.2s', fontVariationSettings: "'FILL' 1" }} className="material-symbols-outlined text-primary/60 absolute left-1/2 translate-x-[1.5rem] top-2 text-xl animate-heart-celebrate">favorite</span>
      
      <span style={{ animationDelay: '0.4s', fontVariationSettings: "'FILL' 1" }} className="material-symbols-outlined text-primary/50 absolute left-1/2 -translate-x-[1.5rem] top-8 text-lg animate-heart-celebrate">favorite</span>
      <span style={{ animationDelay: '0.4s', fontVariationSettings: "'FILL' 1" }} className="material-symbols-outlined text-primary/50 absolute left-1/2 translate-x-[0.5rem] top-8 text-lg animate-heart-celebrate">favorite</span>
      <span style={{ animationDelay: '0.5s', fontVariationSettings: "'FILL' 1" }} className="material-symbols-outlined text-primary/40 absolute left-1/2 translate-x-[2.5rem] top-9 text-base animate-heart-celebrate">favorite</span>
  </div>
);

export default function GameStage({ onSuccess, user }: GameStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("idle");
  const gameLoopRef = useRef<number>();
  
  const [isMapModalOpen, setMapModalOpen] = useState(false);
  const [isKeywordModalOpen, setKeywordModalOpen] = useState(false);
  const [isInstructionsModalOpen, setInstructionsModalOpen] = useState(false);

  const isDevMode = user === 'manuel';
  const initialTargetScore = useMemo(() => isDevMode ? 5 : 35, [isDevMode]);
  const [targetScore, setTargetScore] = useState(initialTargetScore);

  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const foodRef = useRef({ x: 15, y: 15 });
  const directionRef = useRef({ x: 0, y: -1 });

  const coordinates = "19.4326° N, 99.1332° W";
  const lat = "19.4326";
  const long = "-99.1332";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;
  const iframeUrl = `https://maps.google.com/maps?q=${lat},${long}&hl=es&z=14&output=embed`;

  const drawHeart = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    const topCurveHeight = height * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(
      x - width / 2,
      y + (height + topCurveHeight) / 2,
      x,
      y + (height + topCurveHeight) / 2,
      x,
      y + height
    );
    ctx.bezierCurveTo(
      x,
      y + (height + topCurveHeight) / 2,
      x + width / 2,
      y + (height + topCurveHeight) / 2,
      x + width / 2,
      y + topCurveHeight
    );
    ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = "destination-over";
  };

  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    foodRef.current = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    directionRef.current = { x: 0, y: -1 };
    setScore(0);
    setGameState("idle");
  }, []);

  const startGame = useCallback(() => {
    setInstructionsModalOpen(false);
    resetGame();
    setGameState("playing");
  }, [resetGame]);

  const openInstructions = () => {
    setInstructionsModalOpen(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== "playing") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gameTick = () => {
      const snake = snakeRef.current;
      const head = {
        x: snake[0].x + directionRef.current.x,
        y: snake[0].y + directionRef.current.y,
      };

      if (head.x < 0) head.x = GRID_SIZE - 1;
      if (head.x >= GRID_SIZE) head.x = 0;
      if (head.y < 0) head.y = GRID_SIZE - 1;
      if (head.y >= GRID_SIZE) head.y = 0;

      if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
        setGameState("lost");
        if (score > highScore) setHighScore(score);
        
        if (!isDevMode) {
            setTargetScore(15);
        }

        return;
      }

      snake.unshift(head);

      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        const newScore = score + 1;
        setScore(newScore);

        if (newScore >= targetScore) {
          setGameState("won");
          if (newScore > highScore) setHighScore(newScore);
          return;
        }

        let newFoodPosition;
        do {
          newFoodPosition = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          };
        } while (
          snake.some(
            (segment) =>
              segment.x === newFoodPosition.x && segment.y === newFoodPosition.y
          )
        );
        foodRef.current = newFoodPosition;
      } else {
        snake.pop();
      }

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      snake.forEach((segment, index) => {
        const opacity = Math.max(0.4, 1 - index * 0.1);
        drawHeart(
          ctx,
          segment.x * TILE_SIZE + TILE_SIZE / 2,
          segment.y * TILE_SIZE,
          TILE_SIZE * 0.9,
          TILE_SIZE * 0.9,
          `hsla(342, 85%, 75%, ${opacity})`
        );
      });

      drawHeart(
        ctx,
        foodRef.current.x * TILE_SIZE + TILE_SIZE / 2,
        foodRef.current.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
        "hsl(342, 85%, 55%)"
      );
    };

    const runGame = () => {
      if (gameState === "playing") {
        gameTick();
        gameLoopRef.current = window.setTimeout(runGame, 150);
      }
    };

    runGame();

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const dir = directionRef.current;
      switch (e.key) {
        case "ArrowUp":
          if (dir.y === 0) directionRef.current = { x: 0, y: -1 };
          break;
        case "ArrowDown":
          if (dir.y === 0) directionRef.current = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
          if (dir.x === 0) directionRef.current = { x: -1, y: 0 };
          break;
        case "ArrowRight":
          if (dir.x === 0) directionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(gameLoopRef.current);
    };
  }, [gameState, score, highScore, targetScore, isDevMode]);

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
    onSuccess();
  }, [onSuccess]);

  const hintProgress = (score / targetScore) * 100;

  return (
    <>
      <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-6 rounded-2xl bg-card p-0 relative overflow-hidden aspect-square"
              )}
            >
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:30px_30px]"></div>

              {gameState === "idle" && (
                <div className="flex flex-col items-center gap-4 z-10 text-center animate-fade-in p-8">
                  <div className="relative bg-background w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border border-primary/10">
                    <Gamepad2 className="text-primary h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground pt-4">
                    Heart Snake Board
                  </h3>
                  <p className="max-w-xs text-muted-foreground">
                    Para seguir avanzando, debes de completar este desafío.
                  </p>
                  <Button
                    onClick={openInstructions}
                    className="mt-6 h-12 px-8 rounded-lg text-base font-bold tracking-wider shadow-lg shadow-primary/20"
                    size="lg"
                  >
                    Empezar Desafío
                  </Button>
                </div>
              )}

              {(gameState === "playing" || gameState === "won" || gameState === "lost") && (
                <canvas
                  ref={canvasRef}
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  className={cn(
                    "rounded-lg bg-pink-100/20 dark:bg-pink-900/10 transition-opacity duration-500",
                    (gameState === "lost" || gameState === "won") && "opacity-10",
                    "w-full h-auto aspect-square"
                  )}
                />
              )}

              {(gameState === "won" || gameState === "lost") && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 animate-fade-in z-20">
                  <h3 className="text-2xl font-bold text-foreground">
                    {gameState === "won"
                      ? "¡Felicidades, lo lograste!"
                      : "¡Oh no! Fin del juego"}
                  </h3>
                  <p className="text-muted-foreground mt-2 mb-6">
                    {gameState === "won"
                      ? "Has recolectado todos los corazones."
                      : `No te preocupes, ¡inténtalo de nuevo! La nueva meta es ${targetScore} corazones.`}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button
                      onClick={gameState === 'won' ? () => setMapModalOpen(true) : startGame}
                      className="min-w-[200px] h-12 px-6 text-base font-bold tracking-wider"
                    >
                      {gameState === 'won' ? 'Ver Pista' : 'Reintentar'}
                    </Button>
                  </div>
                  {gameState === "won" && <VictoryHearts />}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card/50 dark:bg-zinc-800/30 border border-border p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <SimpleCircularProgress progress={(score / targetScore) * 100} size={80} strokeWidth={6}>
                  <Heart className="h-6 w-6 text-primary" />
                </SimpleCircularProgress>
                <span className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Recolectados</span>
                <span className="text-2xl font-bold text-foreground">{score}</span>
              </div>
              <div className="bg-card/50 dark:bg-zinc-800/30 border border-border p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <SimpleCircularProgress progress={100} size={80} strokeWidth={6}>
                  <span className="material-symbols-outlined text-primary text-3xl">flag</span>
                </SimpleCircularProgress>
                <span className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Meta</span>
                <span className="text-2xl font-bold text-foreground">{targetScore}</span>
              </div>
            </div>

            <div className="bg-card/50 dark:bg-zinc-800/30 border border-border p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Trophy className="w-5 h-5" />
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
                  {gameState === 'won' ? 'Pista 1: Desbloqueada' : 'Pista 1: Bloqueada'}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground italic pl-11 mb-4">
                "En el centro de lo que parece vacío, encontrarás lo que buscas..."
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
                <Info className="h-4 w-4 shrink-0" />
                Usa las flechas del teclado para guiar al corazón.
              </div>
            </div>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="md:hidden mt-4 grid grid-cols-3 gap-3 w-48">
            <div />
            <Button
              variant="secondary"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={() => {
                if (directionRef.current.y === 0) directionRef.current = { x: 0, y: -1 };
              }}
            >
              <ChevronUp className="h-8 w-8" />
            </Button>
            <div />
            <Button
              variant="secondary"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={() => {
                if (directionRef.current.x === 0) directionRef.current = { x: -1, y: 0 };
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <div />
            <Button
              variant="secondary"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={() => {
                if (directionRef.current.x === 0) directionRef.current = { x: 1, y: 0 };
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
            <div />
            <Button
              variant="secondary"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={() => {
                if (directionRef.current.y === 0) directionRef.current = { x: 0, y: 1 };
              }}
            >
              <ChevronDown className="h-8 w-8" />
            </Button>
            <div />
          </div>
        )}

        <Dialog open={isInstructionsModalOpen} onOpenChange={setInstructionsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center font-bold">Desafío 1: Snake Romance</DialogTitle>
              <DialogDescription asChild>
                <div className="text-center pt-4 space-y-3 text-base text-muted-foreground">
                  <div>Usa las flechas del teclado (o los botones en pantalla) para mover la serpiente de corazones.</div>
                  <div>El objetivo es recolectar <span className="font-bold text-primary">{targetScore}</span> corazones sin chocar contigo misma.</div>
                  <div className="pt-2">¡Mucha suerte, mi chula!</div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4">
              <Button onClick={startGame} className="w-full h-12 text-lg font-bold">¡Vamos!</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setMapModalOpen(false)}
        onNextChallenge={handleOpenKeywordModal}
        coordinates={coordinates}
        googleMapsUrl={googleMapsUrl}
        iframeUrl={iframeUrl}
      />

      <KeywordModal
        isOpen={isKeywordModalOpen}
        onSuccess={handleKeywordSuccess}
        onBack={handleReturnToMap}
        correctKeyword="tu"
        title="Primera Palabra Clave"
        description="Ingresa la palabra clave que encontraste en la ubicación de la pista para continuar."
      />
    </>
  );
}
