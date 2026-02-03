"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";

const GRID_SIZE = 20;
const CANVAS_SIZE = 600;
const TILE_SIZE = CANVAS_SIZE / GRID_SIZE;
const TARGET_SCORE = 20;

type GameStageProps = {
  onSuccess: () => void;
};

type GameState = "idle" | "playing" | "won" | "lost";

export default function GameStage({ onSuccess }: GameStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("idle");
  const gameLoopRef = useRef<number>();

  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const foodRef = useRef({ x: 15, y: 15 });
  const directionRef = useRef({ x: 0, y: -1 });

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

  const startGame = () => {
    resetGame();
    setGameState("playing");
  };

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    foodRef.current = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    directionRef.current = { x: 0, y: -1 };
    setScore(0);
    setGameState("idle");
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

      if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE ||
        snake.some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        setGameState("lost");
        if (score > highScore) setHighScore(score);
        return;
      }

      snake.unshift(head);

      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        const newScore = score + 1;
        setScore(newScore);

        if (newScore >= TARGET_SCORE) {
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
  }, [gameState, score, highScore]);

  const heartsNeeded = TARGET_SCORE - score;
  const hintProgress = (score / TARGET_SCORE) * 100;

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2 rounded-xl p-6 border border-primary/20 bg-card shadow-sm w-80">
        <div className="flex items-center gap-3 text-primary">
          <Heart className="w-5 h-5" />
          <p className="text-foreground text-lg font-medium leading-normal">
            Corazones Recolectados
          </p>
        </div>
        <p className="text-primary tracking-light text-5xl font-bold leading-tight">
          {score}
        </p>
        {score > 0 && score >= highScore && (
          <p className="text-green-600 text-sm font-medium leading-normal">
            ¡Nuevo récord personal!
          </p>
        )}
      </div>

      <div className="w-full p-2 rounded-xl border-2 border-primary/20 bg-card/80">
        <div
          className={cn(
            "flex flex-col items-center gap-6 rounded-lg border-4 border-primary/30 bg-card/90 px-6 py-10 shadow-inner relative overflow-hidden min-h-[600px] justify-center",
            "dark:bg-black/20"
          )}
        >
          {gameState === "idle" && (
            <div className="flex max-w-[480px] flex-col items-center gap-4 z-10 text-center animate-fade-in">
              <div className="w-full h-64 bg-accent/30 dark:bg-accent/10 rounded-lg border border-primary/10 flex items-center justify-center relative overflow-hidden">
                <div className="flex gap-1 absolute top-20 left-20">
                  <Heart className="text-primary/80 fill-primary/80" />
                  <Heart className="text-primary/60 fill-primary/60" />
                  <Heart className="text-primary/40 fill-primary/40" />
                </div>
                <div className="absolute bottom-12 right-24 animate-pulse">
                  <Heart className="text-primary fill-primary" />
                </div>
                <p className="text-foreground/20 font-bold uppercase tracking-widest text-xl">
                  Heart Snake Board
                </p>
              </div>
              <p className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em]">
                Ready to Play?
              </p>
              <p className="text-muted-foreground text-sm font-normal leading-normal max-w-xs">
                Recoge {TARGET_SCORE} corazones para desbloquear la primera pista de
                tu regalo de San Valentín.
              </p>
              <Button
                onClick={startGame}
                className="min-w-[200px] h-12 px-6 text-base font-bold tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30 z-10"
              >
                EMPEZAR JUEGO
              </Button>
            </div>
          )}

          {(gameState === "playing" ||
            gameState === "won" ||
            gameState === "lost") && (
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className={cn(
                "rounded-lg bg-accent/20",
                (gameState === "lost" || gameState === "won") && "opacity-20"
              )}
              style={{ maxWidth: "100%", height: "auto" }}
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
                  : "No te preocupes, ¡inténtalo de nuevo!"}
              </p>
              <Button
                onClick={gameState === 'won' ? onSuccess : startGame}
                className="min-w-[200px] h-12 px-6 text-base font-bold tracking-wider"
              >
                {gameState === 'won' ? 'Siguiente Pista' : 'Reintentar'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {gameState !== "won" && (
        <div className="w-full mt-2 p-6 bg-primary/10 border border-dashed border-primary/40 rounded-xl flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <Lock className="text-primary" />
            <h3 className="text-primary font-bold text-lg">
              Pista 1: Bloqueada
            </h3>
          </div>
          <p className="text-center text-sm text-foreground/70">
            {score < TARGET_SCORE
              ? `Necesitas ${heartsNeeded} corazones más para revelar la primera ubicación de nuestra cita especial.`
              : "¡Pista desbloqueada! Completa el juego para verla."}
          </p>
          <Progress value={hintProgress} className="h-2 w-full" />
        </div>
      )}

      {gameState === 'won' && (
        <div className="w-full mt-2 p-6 bg-green-500/10 border border-dashed border-green-500/40 rounded-xl flex flex-col items-center gap-4 text-center animate-fade-in">
           <h3 className="text-green-500 font-bold text-lg">
              Pista 1: ¡Desbloqueada!
            </h3>
            <p className="text-foreground/80">Ve a estas coordenadas y busca tu sorpresa: <strong>19.4326° N, 99.1332° W</strong></p>
        </div>
      )}
    </div>
  );
}
