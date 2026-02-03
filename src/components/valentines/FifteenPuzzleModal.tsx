'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Map, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Puzzle constants
const GRID_SIZE = 4;
const TILE_COUNT = GRID_SIZE * GRID_SIZE;
const EMPTY_TILE = TILE_COUNT - 1; // The last tile (15) is our empty space
const PUZZLE_DIMENSION = 400; // The dimension of the puzzle board in pixels
const TILE_DIMENSION = PUZZLE_DIMENSION / GRID_SIZE;

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
  const { toast } = useToast();
  
  const puzzleImage = useMemo(() => PlaceHolderImages.find(img => img.id === 'puzzle-image'), []);

  // Modal open/close transition management
  useEffect(() => {
    if (isOpen) {
      setIsShowing(true);
      // Initialize puzzle state
      setTiles(shuffleTiles());
      setIsSolved(false);
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

      if (checkIfSolved(newTiles)) {
        setIsSolved(true);
        toast({
            title: "¡Rompecabezas Resuelto!",
            description: "Has revelado la última pista. ¡Felicidades!",
        });
      }
    }
  };

  // New map data for the final clue
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
          'relative w-full max-w-2xl m-4 bg-card text-card-foreground rounded-xl shadow-2xl shadow-primary/20 border border-primary/10 transition-all duration-300',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {!isSolved ? (
            <div className="p-6 sm:p-8 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">Un último juego...</h2>
                <p className="text-muted-foreground mb-6">Ordena la imagen para revelar la pista final de tu sorpresa.</p>
                <div 
                    className="relative mx-auto grid border-2 border-primary/20 bg-black/20 rounded-lg overflow-hidden"
                    style={{
                        width: PUZZLE_DIMENSION,
                        height: PUZZLE_DIMENSION,
                        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    }}
                >
                    {tiles.map((tileValue, index) => {
                        const isEMPTY_TILE = tileValue === EMPTY_TILE;
                        const correctRow = Math.floor(tileValue / GRID_SIZE);
                        const correctCol = tileValue % GRID_SIZE;
                        
                        return (
                            <div
                                key={index}
                                onClick={() => handleTileClick(index)}
                                className={cn(
                                    "bg-cover bg-no-repeat transition-all duration-300 ease-out",
                                    !isEMPTY_TILE && "cursor-pointer hover:scale-105 hover:z-10 shadow-md",
                                    isEMPTY_TILE && "bg-card/50"
                                )}
                                style={{
                                    width: TILE_DIMENSION,
                                    height: TILE_DIMENSION,
                                    backgroundImage: !isEMPTY_TILE && puzzleImage ? `url(${puzzleImage.imageUrl})` : 'none',
                                    backgroundPosition: `-${correctCol * TILE_DIMENSION}px -${correctRow * TILE_DIMENSION}px`,
                                    backgroundSize: `${PUZZLE_DIMENSION}px ${PUZZLE_DIMENSION}px`,
                                }}
                            />
                        );
                    })}
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
