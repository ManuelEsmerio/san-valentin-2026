
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Lock, Trophy, Target, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";
import MapModal from "./MapModal";

const GRID_SIZE = 20;
const CANVAS_SIZE = 600;
const TILE_SIZE = CANVAS_SIZE / GRID_SIZE;
const TARGET_SCORE = 2;

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
  const [isMapModalOpen, setMapModalOpen] = useState(false);

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

      // Wrap around logic for walls
      if (head.x < 0) head.x = GRID_SIZE - 1;
      if (head.x >= GRID_SIZE) head.x = 0;
      if (head.y < 0) head.y = GRID_SIZE - 1;
      if (head.y >= GRID_SIZE) head.y = 0;

      // Check for self-collision
      if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
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
  }, [gameState, score, highScore]);

  const heartsNeeded = TARGET_SCORE - score;
  const hintProgress = (score / TARGET_SCORE) * 100;

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="w-full flex flex-wrap justify-center gap-4">
        <div className="flex min-w-[180px] flex-1 flex-col items-center gap-2 rounded-xl p-4 border border-primary/20 bg-card shadow-sm">
            <div className="flex items-center gap-2 text-primary">
                <Heart className="w-5 h-5"/>
                <p className="text-foreground text-sm font-medium leading-normal">Recolectados</p>
            </div>
            <p className="text-primary tracking-light text-4xl font-bold leading-tight">{score}</p>
        </div>

        <div className="flex min-w-[180px] flex-1 flex-col items-center gap-2 rounded-xl p-4 border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="w-5 h-5"/>
                <p className="text-foreground text-sm font-medium leading-normal">Récord</p>
            </div>
            <p className="text-foreground tracking-light text-4xl font-bold leading-tight">{highScore}</p>
        </div>
        
        <div className="flex min-w-[180px] flex-1 flex-col items-center gap-2 rounded-xl p-4 border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="w-5 h-5"/>
                <p className="text-foreground text-sm font-medium leading-normal">Meta</p>
            </div>
            <p className="text-foreground tracking-light text-4xl font-bold leading-tight">{TARGET_SCORE}</p>
        </div>
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
              <p className="text-muted-foreground text-xs mt-2 hidden md:block">
                Usa las flechas del teclado para moverte.
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
                "rounded-lg bg-pink-100/20 dark:bg-pink-900/10",
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
                onClick={gameState === 'won' ? () => setMapModalOpen(true) : startGame}
                className="min-w-[200px] h-12 px-6 text-base font-bold tracking-wider"
              >
                {gameState === 'won' ? 'Ver Pista' : 'Reintentar'}
              </Button>
            </div>
          )}
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

      <MapModal 
        isOpen={isMapModalOpen}
        onClose={() => setMapModalOpen(false)}
        onSuccess={onSuccess}
        coordinates={coordinates}
        googleMapsUrl={googleMapsUrl}
        iframeUrl={iframeUrl}
      />
    </div>
  );
}
