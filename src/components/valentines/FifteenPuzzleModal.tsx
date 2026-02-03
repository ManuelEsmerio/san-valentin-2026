'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Map, MapPin, BarChart2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Puzzle constants
const GRID_SIZE = 4;
const TILE_COUNT = GRID_SIZE * GRID_SIZE;
const EMPTY_TILE = TILE_COUNT - 1; // The last tile (15) is our empty space

// Function to generate a solvable shuffled puzzle
const shuffleTiles = () => {
    let tiles = [...Array(TILE_COUNT).keys()];
    let emptyPos = tiles.indexOf(EMPTY_TILE);

    // Perform a large number of random moves from the solved state
    for (let i = 0; i < 300; i++) {
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
    
    // It could be solved by chance, if so, swap two tiles
    if (tiles.every((tile, index) => tile === index)) {
        [tiles[0], tiles[1]] = [tiles[1], tiles[0]];
    }

    return tiles;
};

type FifteenPuzzleModalProps = {
  isOpen: boolean;
  onSuccess: () => void;
};

export default function FifteenPuzzleModal({ isOpen, onSuccess }: FifteenPuzzleModalProps) {
  const [isShowing, setIsShowing] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen) {
      setIsShowing(true);
      handleRestart();
    } else {
      const timer = setTimeout(() => setIsShowing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const checkIfSolved = (currentTiles: number[]) => {
    for (let i = 0; i < TILE_COUNT; i++) {
        if (currentTiles[i] !== i) return false;
    }
    return true;
  };

  const handleTileClick = (clickedIndex: number) => {
    if (isSolved) return;

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
      setMoves(prev => prev + 1);

      if (checkIfSolved(newTiles)) {
        setTimeout(() => {
            setIsSolved(true);
            toast({
                title: "¡Rompecabezas Resuelto!",
                description: "Has revelado la última pista. ¡Felicidades!",
            });
        }, 300);
      }
    }
  };

  const handleRestart = () => {
    setTiles(shuffleTiles());
    setMoves(0);
    setIsSolved(false);
  };
  
  const coordinates = "19.4173° N, 99.1652° W";
  const lat = "19.4173";
  const long = "-99.1652";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;
  const iframeUrl = `https://maps.google.com/maps?q=${lat},${long}&hl=es&z=14&output=embed`;
  
  if (!isShowing) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div
        className={cn(
          'relative w-full max-w-lg m-4 bg-card text-card-foreground rounded-2xl shadow-2xl shadow-primary/20 border border-primary/10 transition-all duration-300 dark:bg-zinc-900 dark:border-zinc-800',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {!isSolved ? (
            <div className="p-6 md:p-8 text-center">
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
                                  key={tileValue}
                                  onClick={() => handleTileClick(index)}
                                  className={cn(
                                      "flex items-center justify-center rounded-lg md:rounded-xl text-xl font-bold transition-all duration-200 ease-in-out select-none",
                                      !isEmpty
                                          ? "bg-primary text-white shadow-md cursor-pointer hover:brightness-110 hover:scale-[.98]"
                                          : "empty bg-white/50 dark:bg-zinc-700/50 border-2 border-dashed border-primary/20 cursor-default",
                                  )}
                              >
                                  {!isEmpty ? tileValue + 1 : ''}
                              </div>
                          );
                      })}
                  </div>
                </div>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400">
                        <BarChart2 className="text-primary h-5 w-5" />
                        <span className="font-bold text-sm">{moves} Movimientos</span>
                    </div>
                    <Button 
                        onClick={handleRestart}
                        variant="default"
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 h-auto rounded-full font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-pink-200 dark:shadow-none"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reiniciar Juego
                    </Button>
                </div>
            </div>
        ) : (
          <div className="p-6 sm:p-8 text-center animate-fade-in">
            <div className="flex justify-center items-center gap-2 mb-4">
                <MapPin className="text-primary h-8 w-8" />
                <h2 className="text-2xl font-bold text-foreground">¡Pista Final Desbloqueada!</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">
                ¡Lo lograste! Has superado todos los desafíos. Tu recompensa final te espera en este lugar. Es hora de la gran sorpresa.
            </p>

            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg bg-black/10 border border-border mb-4">
                <iframe
                    src={iframeUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>

            <div className="bg-accent/50 p-4 rounded-lg mb-6">
                <p className="text-lg font-mono text-primary font-bold">
                    {coordinates}
                </p>
            </div>

            <div className="flex flex-col gap-3">
                <Button onClick={onSuccess} className="w-full h-12 text-lg font-bold">
                    Ir a la Sorpresa Final
                </Button>
                <Button asChild variant="outline" className="w-full h-12 text-base font-bold">
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                        <Map className="mr-2" />
                        Abrir en Google Maps
                    </a>
                </Button>
            </div>
        </div>
        )}
      </div>
    </div>
  );
}
