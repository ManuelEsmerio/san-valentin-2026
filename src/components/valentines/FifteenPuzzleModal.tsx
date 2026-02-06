'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BarChart2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import KeywordModal from './KeywordModal';
import MapModal from './MapModal';

// Puzzle constants
const GRID_SIZE = 4;
const TILE_COUNT = GRID_SIZE * GRID_SIZE;
const EMPTY_TILE = TILE_COUNT - 1; // The last tile (15) is our empty space
const MOVE_LIMIT = 250;

type Difficulty = 'normal' | 'easy' | 'very-easy';

// Function to generate a solvable shuffled puzzle based on difficulty
const shuffleTiles = (difficulty: Difficulty) => {
    let tiles = [...Array(TILE_COUNT).keys()];
    let emptyPos = tiles.indexOf(EMPTY_TILE);

    const shuffleCount = {
        'normal': 300,
        'easy': 100,
        'very-easy': 30,
    }[difficulty];

    // Perform a large number of random moves from the solved state
    for (let i = 0; i < shuffleCount; i++) {
        const neighbors = [];
        const row = Math.floor(emptyPos / GRID_SIZE);
        const col = emptyPos % GRID_SIZE;

        if (row > 0) neighbors.push(emptyPos - GRID_SIZE); // up
        if (row < GRID_SIZE - 1) neighbors.push(emptyPos + GRID_SIZE); // down
        if (col > 0) neighbors.push(emptyPos - 1); // left
        if (col < GRID_SIZE - 1) neighbors.push(emptyPos + 1); // right

        const randNeighborIndex = Math.floor(Math.random() * neighbors.length);
        const neighborPos = neighbors[randNeighborIndex];
        
        [tiles[emptyPos], tiles[neighborPos]] = [tiles[neighborPos], tiles[emptyPos]];
        emptyPos = neighborPos;
    }
    
    // It could be solved by chance, if so, swap two tiles to ensure it's a puzzle
    if (tiles.every((tile, index) => tile === index)) {
        [tiles[0], tiles[1]] = [tiles[1], tiles[0]];
    }

    return tiles;
};

type GameStatus = 'playing' | 'solved' | 'lost';

type FifteenPuzzleModalProps = {
  isOpen: boolean;
  onAdvance?: () => void;
  onGameWon: () => void;
  user: string | null;
  initialGameState?: GameStatus;
};

const VictoryHearts = () => (
    <div className="relative mt-2 h-16 w-full pointer-events-none">
        <span style={{ animationDelay: '0.2s', fontVariationSettings: "'FILL' 1" }} className="material-symbols-rounded text-primary/60 absolute left-1/2 -translate-x-[2.5rem] top-2 text-xl animate-heart-celebrate">favorite</span>
        <span style={{ animationDelay: '0s', fontVariationSettings: "'FILL' 1" }} className="material-symbols-rounded text-primary/70 absolute left-1/2 -translate-x-1/2 text-2xl animate-heart-celebrate">favorite</span>
        <span style={{ animationDelay: '0.2s', fontVariationSettings: "'FILL' 1" }} className="material-symbols-rounded text-primary/60 absolute left-1/2 translate-x-[1.5rem] top-2 text-xl animate-heart-celebrate">favorite</span>
        
        <span style={{ animationDelay: '0.4s', fontVariationSettings: "'FILL' 1" }} className="material-symbols-rounded text-primary/50 absolute left-1/2 -translate-x-[1.5rem] top-8 text-lg animate-heart-celebrate">favorite</span>
        <span style={{ animationDelay: '0.4s', fontVariationSettings: "'FILL' 1" }} className="material-symbols-rounded text-primary/50 absolute left-1/2 translate-x-[0.5rem] top-8 text-lg animate-heart-celebrate">favorite</span>
        <span style={{ animationDelay: '0.5s', fontVariationSettings: "'FILL' 1" }} className="material-symbols-rounded text-primary/40 absolute left-1/2 translate-x-[2.5rem] top-9 text-base animate-heart-celebrate">favorite</span>
    </div>
  );

export default function FifteenPuzzleModal({ isOpen, onAdvance, onGameWon, user, initialGameState = 'playing' }: FifteenPuzzleModalProps) {
  const [isShowing, setIsShowing] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>(initialGameState);
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [losses, setLosses] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [isKeywordModalOpen, setKeywordModalOpen] = useState(false);
  const [isMapModalOpen, setMapModalOpen] = useState(false);
  const { toast } = useToast();
  
  const initializeGame = useCallback((currentDifficulty: Difficulty) => {
    setTiles(shuffleTiles(currentDifficulty));
    setMoves(0);
    setGameStatus('playing');
  }, []);
  
  useEffect(() => {
    if (isOpen) {
      setIsShowing(true);
      if (initialGameState !== 'solved') {
        setLosses(0);
        setDifficulty('normal');
        initializeGame('normal');
      } else {
        setGameStatus('solved');
      }
    } else {
      const timer = setTimeout(() => {
        setIsShowing(false);
        setKeywordModalOpen(false);
        setMapModalOpen(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initializeGame, initialGameState]);

  const checkIfSolved = useCallback((currentTiles: number[]) => {
    return currentTiles.every((tile, index) => tile === index);
  }, []);

  const handleSuccess = useCallback(() => {
    onGameWon();
    setGameStatus('solved');
  }, [onGameWon]);

  useEffect(() => {
    if (gameStatus === 'solved' && initialGameState !== 'solved') {
      // This logic was changed to handle success more directly
    }
  }, [gameStatus, initialGameState, handleSuccess]);

  const handleTileClick = useCallback((clickedIndex: number) => {
    if (gameStatus !== 'playing') return;

    const emptyIndex = tiles.indexOf(EMPTY_TILE);
    
    const clickedRow = Math.floor(clickedIndex / GRID_SIZE);
    const clickedCol = clickedIndex % GRID_SIZE;
    const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
    const emptyCol = emptyIndex % GRID_SIZE;

    const isAdjacent = 
      (clickedRow === emptyRow && Math.abs(clickedCol - emptyCol) === 1) ||
      (clickedCol === emptyCol && Math.abs(clickedRow - emptyRow) === 1);
      
    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[clickedIndex], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[clickedIndex]];
      setTiles(newTiles);
      
      const newMoves = moves + 1;
      setMoves(newMoves);

      if (checkIfSolved(newTiles)) {
        handleSuccess();
        toast({
          title: "¡Rompecabezas Resuelto!",
          description: "Has revelado la última pista. ¡Felicidades!",
        });
      } else if (newMoves >= MOVE_LIMIT) {
          const newLosses = losses + 1;
          setLosses(newLosses);
          if (newLosses === 1) setDifficulty('easy');
          if (newLosses >= 2) setDifficulty('very-easy');
          setGameStatus('lost');
      }
    }
  }, [gameStatus, tiles, moves, checkIfSolved, losses, handleSuccess, toast]);

  const handleRestart = useCallback(() => {
    initializeGame(difficulty);
  }, [initializeGame, difficulty]);
  
  const handleKeywordSuccess = useCallback(() => {
    onAdvance?.();
  }, [onAdvance]);

  const coordinates = "20.8805° N, -103.8390° W";
  const lat = "20.8805";
  const long = "-103.8390";
  const googleMapsUrl = "https://maps.app.goo.gl/aP1eyTNWo6rGzdXXA";
  const iframeUrl = `https://maps.google.com/maps?q=${lat},${long}&hl=es&z=14&output=embed`;
  
  if (!isShowing) {
    return null;
  }

  const renderContent = () => {
    if (gameStatus === 'lost') {
        return (
          <div className="p-6 sm:p-8 text-center animate-fade-in">
               <span className="material-symbols-rounded text-destructive text-5xl mb-4">sentiment_dissatisfied</span>
               <h2 className="text-2xl font-bold text-foreground mb-2">¡Casi lo logras!</h2>
               <p className="text-muted-foreground mb-6">
                  Has superado el límite de movimientos. ¡Pero no te preocupes, inténtalo de nuevo!
               </p>
               <div className="flex flex-col gap-3">
                  <Button onClick={handleRestart} className="w-full h-12 text-base font-bold">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reintentar
                  </Button>
               </div>
          </div>
        );
    }
    if (gameStatus === 'solved') {
        return (
          <div className="p-6 sm:p-8 text-center animate-fade-in">
            <span className="material-symbols-rounded text-green-500 text-5xl mb-4">auto_awesome</span>
            <h2 className="text-2xl font-bold text-foreground mb-2">¡Rompecabezas Resuelto!</h2>
            <p className="text-muted-foreground mb-6">
                Has revelado la última pista. ¡Felicidades!
            </p>
            <VictoryHearts />
            <Button onClick={() => setMapModalOpen(true)} className="w-full h-12 text-lg font-bold mt-4">
                Ver Pista Final
            </Button>
          </div>
        );
    }
    
    // Default: 'playing'
    return (
      <div className="p-6 md:p-8 text-center animate-fade-in">
          <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                  Un último juego...
              </h1>
              <p className="text-primary font-medium text-lg leading-relaxed">
                  Ordena los números para revelar la pista final de tu sorpresa.
              </p>
          </div>
          <div className="bg-pink-50 dark:bg-zinc-800/50 p-3 rounded-2xl max-w-sm mx-auto shadow-inner">
            <div className="grid grid-cols-4 gap-2 aspect-square">
                {tiles.map((tileValue, index) => {
                    const isEmpty = tileValue === EMPTY_TILE;
                    return (
                        <div
                            key={index}
                            onClick={() => handleTileClick(index)}
                            className={cn("flex items-center justify-center rounded-lg md:rounded-xl text-xl font-bold transition-colors duration-200 ease-in-out select-none touch-manipulation", !isEmpty ? "bg-primary text-white shadow-md cursor-pointer" : "empty bg-white/50 dark:bg-zinc-700/50 border-2 border-dashed border-primary/20 cursor-default")}>
                            {!isEmpty ? tileValue + 1 : ''}
                        </div>
                    );
                })}
            </div>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400">
                  <BarChart2 className="text-primary h-5 w-5" />
                  <span className="font-bold text-sm">{moves} / {MOVE_LIMIT} Movimientos</span>
              </div>
              <div className="flex items-center gap-4">
                <Button onClick={handleRestart} variant="outline" className="px-6 py-3 h-auto rounded-full font-bold">
                    <RotateCcw className="h-4 w-4" />
                    Reiniciar
                </Button>
                {user === 'manuel' && (
                    <Button onClick={onGameWon} variant="secondary" className="px-6 py-3 h-auto rounded-full font-bold">
                        Saltar (Dev)
                    </Button>
                )}
              </div>
          </div>
      </div>
    );
}

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div
          className={cn(
            'relative w-full max-w-2xl m-4 bg-card text-card-foreground rounded-2xl shadow-2xl shadow-primary/20 border border-primary/10 transition-all duration-300 dark:bg-zinc-900 dark:border-zinc-800',
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {renderContent()}
        </div>
      </div>
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setMapModalOpen(false)}
        onNextChallenge={() => { setMapModalOpen(false); setKeywordModalOpen(true); }}
        coordinates={coordinates}
        googleMapsUrl={googleMapsUrl}
        iframeUrl={iframeUrl}
        title="¡Última Pista!"
        description={
            <p>Esta es la última pista. Espero que este detalle te haya gustado tanto como a mí me encantó crearlo. Así que no te hago esperar más: ve a la pastelería de Yeimy a recoger tu rico postre y la última palabra para descubrir el gran premio.</p>
        }
      />
      <KeywordModal
        isOpen={isKeywordModalOpen}
        onSuccess={handleKeywordSuccess}
        onBack={() => {
          setKeywordModalOpen(false);
          setMapModalOpen(true);
        }}
        correctKeyword="Caminarás"
        title="Última Palabra Clave"
        description="Estás a un paso de la frase secreta final. Ingresa la última parte."
      />
    </>
  );
}
