"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Gamepad2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const TILE_SIZE = CANVAS_SIZE / GRID_SIZE;
const TARGET_SCORE = 10;

type GameStageProps = {
  onSuccess: () => void;
};

export default function GameStage({ onSuccess }: GameStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const gameLoopRef = useRef<number>();

  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const foodRef = useRef({ x: 15, y: 15 });
  const directionRef = useRef({ x: 0, y: -1 });
  const scoreRef = useRef(0);

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
  };

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    foodRef.current = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    directionRef.current = { x: 0, y: -1 };
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setGameWon(false);
  };

  const handleDirectionChange = (
    direction: "up" | "down" | "left" | "right"
  ) => {
    const newDirection = { ...directionRef.current };
    switch (direction) {
      case "up":
        if (directionRef.current.y === 0) {
          newDirection.y = -1;
          newDirection.x = 0;
        }
        break;
      case "down":
        if (directionRef.current.y === 0) {
          newDirection.y = 1;
          newDirection.x = 0;
        }
        break;
      case "left":
        if (directionRef.current.x === 0) {
          newDirection.x = -1;
          newDirection.y = 0;
        }
        break;
      case "right":
        if (directionRef.current.x === 0) {
          newDirection.x = 1;
          newDirection.y = 0;
        }
        break;
    }
    directionRef.current = newDirection;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gameTick = () => {
      if (gameOver || gameWon) return;

      const snake = snakeRef.current;
      const head = {
        x: snake[0].x + directionRef.current.x,
        y: snake[0].y + directionRef.current.y,
      };

      if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return;
      }

      for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
          setGameOver(true);
          return;
        }
      }

      snake.unshift(head);

      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        scoreRef.current += 1;
        setScore(scoreRef.current);

        if (scoreRef.current >= TARGET_SCORE) {
          setGameWon(true);
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

      snake.forEach((segment) => {
        drawHeart(
          ctx,
          segment.x * TILE_SIZE + TILE_SIZE / 2,
          segment.y * TILE_SIZE,
          TILE_SIZE * 0.8,
          TILE_SIZE * 0.8,
          "#F08080"
        );
      });

      drawHeart(
        ctx,
        foodRef.current.x * TILE_SIZE + TILE_SIZE / 2,
        foodRef.current.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
        "hsl(var(--primary))"
      );
    };

    const runGame = () => {
      gameTick();
      gameLoopRef.current = window.setTimeout(runGame, 150);
    };

    runGame();

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          handleDirectionChange("up");
          break;
        case "ArrowDown":
          handleDirectionChange("down");
          break;
        case "ArrowLeft":
          handleDirectionChange("left");
          break;
        case "ArrowRight":
          handleDirectionChange("right");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(gameLoopRef.current);
    };
  }, [gameOver, gameWon]);

  useEffect(resetGame, []);

  return (
    <div className="w-full bg-card dark:bg-stone-900 rounded-xl shadow-xl overflow-hidden border border-primary/5">
      <div className="p-4 sm:p-8 flex flex-col items-center gap-4">
        <div className="flex justify-between w-full items-center px-4 py-2 bg-muted rounded-md">
          <div className="font-body">
            Puntuación: {score} / {TARGET_SCORE}
          </div>
          <div className="font-body flex items-center gap-2 text-sm">
            <Gamepad2 className="w-4 h-4" /> Usa las flechas
          </div>
        </div>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="rounded-lg border bg-card"
          style={{ maxWidth: "100%", height: "auto" }}
        />

        <div className="mt-4 grid grid-cols-3 justify-items-center gap-2 md:hidden w-48">
          <div />
          <Button
            variant="outline"
            size="icon"
            className="h-16 w-16 rounded-full"
            onClick={() => handleDirectionChange("up")}
          >
            <ArrowUp className="h-8 w-8" />
          </Button>
          <div />
          <Button
            variant="outline"
            size="icon"
            className="h-16 w-16 rounded-full"
            onClick={() => handleDirectionChange("left")}
          >
            <ArrowLeft className="h-8 w-8" />
          </Button>
          <div />
          <Button
            variant="outline"
            size="icon"
            className="h-16 w-16 rounded-full"
            onClick={() => handleDirectionChange("right")}
          >
            <ArrowRight className="h-8 w-8" />
          </Button>
          <div />
          <Button
            variant="outline"
            size="icon"
            className="h-16 w-16 rounded-full"
            onClick={() => handleDirectionChange("down")}
          >
            <ArrowDown className="h-8 w-8" />
          </Button>
          <div />
        </div>

        {gameWon && (
          <Alert className="animate-fade-in">
            <AlertTitle className="font-headline">
              ¡Felicidades, lo lograste!
            </AlertTitle>
            <AlertDescription className="font-body space-y-4">
              <p>
                💌 Primera pista: Ve a estas coordenadas y busca tu sorpresa:{" "}
                <strong>19.4326° N, 99.1332° W</strong>
              </p>
              <Button
                onClick={onSuccess}
                className="w-full h-12 text-lg font-bold"
              >
                Siguiente paso
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {gameOver && !gameWon && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertTitle className="font-headline">¡Oh no!</AlertTitle>
            <AlertDescription className="font-body space-y-4">
              <p>
                No te preocupes, el amor no tiene 'game over'. ¡Inténtalo de
                nuevo!
              </p>
              <Button
                onClick={resetGame}
                variant="destructive"
                className="w-full h-12 text-lg font-bold"
              >
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
