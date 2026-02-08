'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { romanticPhrases, Phrase } from '@/lib/phrases';

type GameState = 'intro' | 'playing' | 'finished';

type PhraseGameModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

export default function PhraseGameModal({ isOpen, onClose }: PhraseGameModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [gameState, setGameState] = useState<GameState>('intro');
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [builtPhrase, setBuiltPhrase] = useState<string[]>([]);
  const [isIncorrect, setIsIncorrect] = useState(false);
  const { toast } = useToast();

  const initializeGame = useCallback(() => {
    const shuffledPhrases = shuffleArray([...romanticPhrases]);
    setPhrases(shuffledPhrases);
    setCurrentPhraseIndex(0);
    setGameState('intro');
    setBuiltPhrase([]);
    if (shuffledPhrases.length > 0) {
      setAvailableWords(shuffleArray([...shuffledPhrases[0].scrambled]));
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      initializeGame();
    } else {
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initializeGame]);

  const currentPhrase = phrases[currentPhraseIndex];
  
  const handleWordClick = (word: string, source: 'available' | 'built', index: number) => {
    if (source === 'available') {
      setAvailableWords(prev => prev.filter((_, i) => i !== index));
      setBuiltPhrase(prev => [...prev, word]);
    } else {
      setBuiltPhrase(prev => prev.filter((_, i) => i !== index));
      setAvailableWords(prev => [...prev, word]);
    }
    setIsIncorrect(false);
  };

  const checkAnswer = () => {
    const userAnswer = builtPhrase.join(' ');
    if (userAnswer === currentPhrase.correct) {
      toast({
        title: '¡Correcto! ✨',
        description: '¡Qué bien nos conocemos!',
        className: 'bg-green-100 dark:bg-green-900/30 border-green-500',
      });

      if (currentPhraseIndex < phrases.length - 1) {
        const nextIndex = currentPhraseIndex + 1;
        setTimeout(() => {
          setCurrentPhraseIndex(nextIndex);
          setAvailableWords(shuffleArray([...phrases[nextIndex].scrambled]));
          setBuiltPhrase([]);
        }, 800);
      } else {
        setTimeout(() => setGameState('finished'), 800);
      }
    } else {
      setIsIncorrect(true);
      setTimeout(() => setIsIncorrect(false), 500);
      toast({
        variant: 'destructive',
        title: 'Casi... 😅',
        description: 'Intenta ordenar las palabras de nuevo.',
      });
    }
  };

  const progress = useMemo(() => (currentPhraseIndex / phrases.length) * 100, [currentPhraseIndex, phrases.length]);

  if (!isMounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0 border-primary/20 bg-card">
        {gameState === 'intro' && (
          <div className="p-8 text-center flex flex-col items-center gap-4">
            <span className="material-symbols-rounded text-primary text-6xl animate-heart-beat" style={{ fontVariationSettings: "'FILL' 1" }}>draw</span>
            <DialogTitle className="text-2xl font-bold">Arma la Frase del Amor</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              ¡Felicidades por llegar hasta aquí! Como regalo adicional, te propongo un último juego. Ordena las palabras para formar frases románticas. Si las completas todas, habrá una sorpresa final para ti.
            </DialogDescription>
            <Button onClick={() => setGameState('playing')} className="mt-4 w-full max-w-xs h-12 text-lg font-bold">Empezar a Jugar</Button>
          </div>
        )}

        {gameState === 'playing' && currentPhrase && (
          <div className="p-6">
            <div className="text-center mb-4">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Frase {currentPhraseIndex + 1} de {phrases.length}</p>
              <Progress value={progress} className="w-full h-2 mt-2" />
            </div>

            <div className={cn("min-h-[120px] bg-primary/5 rounded-lg p-4 flex flex-wrap items-center justify-center gap-2 mb-4 border-2 border-dashed", isIncorrect ? "border-destructive animate-shake" : "border-primary/20")}>
              {builtPhrase.length === 0 && <p className="text-muted-foreground italic">Toca las palabras de abajo para empezar...</p>}
              {builtPhrase.map((word, i) => (
                <Button key={i} variant="secondary" className="text-base h-10 px-3 cursor-pointer" onClick={() => handleWordClick(word, 'built', i)}>
                  {word}
                </Button>
              ))}
            </div>

            <div className="min-h-[120px] bg-muted/30 rounded-lg p-4 flex flex-wrap items-center justify-center gap-2 mb-6">
              {availableWords.map((word, i) => (
                <Button key={i} variant="outline" className="text-base h-10 px-3 cursor-pointer bg-card" onClick={() => handleWordClick(word, 'available', i)}>
                  {word}
                </Button>
              ))}
            </div>
            
            <Button onClick={checkAnswer} disabled={builtPhrase.length === 0} className="w-full h-12 text-lg font-bold">
              Comprobar Frase
            </Button>
          </div>
        )}
        
        {gameState === 'finished' && (
          <div className="p-8 text-center flex flex-col items-center gap-4 animate-fade-in">
             <span className="material-symbols-rounded text-green-500 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            <DialogTitle className="text-2xl font-bold text-green-600 dark:text-green-400">¡Reto Adicional Completado!</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
             Gracias por jugar. Eres increíble en esto, como en todo. Como premio, tienes derecho a pedir lo que sea para nuestra próxima cita... ¡lo que sea! 😉💘
            </DialogDescription>
            <Button onClick={onClose} className="mt-4 w-full max-w-xs h-12 text-lg font-bold">Cerrar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
