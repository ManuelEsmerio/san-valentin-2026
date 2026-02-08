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
  const [errorCount, setErrorCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [helpTokens, setHelpTokens] = useState(3);
  const [nextWordHint, setNextWordHint] = useState<string | null>(null);
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
    setHelpTokens(3);
    setErrorCount(0);
    setShowHint(false);
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
    setShowHint(false);
  };

  const checkAnswer = () => {
    const userAnswer = builtPhrase.join(' ');
    if (userAnswer === currentPhrase.correct) {
      toast({
        title: '¡Correcto! ✨',
        description: '¡Qué bien nos conocemos!',
        className: 'bg-green-100 dark:bg-green-900/30 border-green-500',
      });
      
      setErrorCount(0);
      setShowHint(false);

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

      const newErrorCount = errorCount + 1;
      setErrorCount(newErrorCount);
      if (newErrorCount >= 2) {
        setShowHint(true);
      }
    }
  };

  const handleRevealStart = () => {
    if (helpTokens <= 0) return;
    setHelpTokens(prev => prev - 1);

    const correctWords = currentPhrase.correct.split(' ');
    const firstTwo = correctWords.slice(0, 2);
    
    let currentAvailable = [...availableWords, ...builtPhrase];
    const finalBuilt: string[] = [];

    for (const word of firstTwo) {
        const indexInAvailable = currentAvailable.findIndex(w => w === word);
        if (indexInAvailable > -1) {
            finalBuilt.push(word);
            currentAvailable.splice(indexInAvailable, 1);
        }
    }

    setBuiltPhrase(finalBuilt);
    setAvailableWords(shuffleArray(currentAvailable));
    setShowHint(false);
    setErrorCount(0);
  };

  const handleNextWordHint = () => {
    if (helpTokens <= 0) return;
    setHelpTokens(prev => prev - 1);

    const correctWords = currentPhrase.correct.split(' ');
    const nextWord = correctWords[builtPhrase.length];

    if (nextWord) {
        setNextWordHint(nextWord);
        setTimeout(() => {
            setNextWordHint(null);
        }, 2000);
    }
    setShowHint(false);
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

            {showHint && currentPhrase.hint && (
              <div className="my-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-500/50 rounded-lg text-center animate-fade-in">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  <span className="font-bold">Pista:</span> {currentPhrase.hint}
                </p>
              </div>
            )}

            <div className="min-h-[120px] bg-muted/30 rounded-lg p-4 flex flex-wrap items-center justify-center gap-2 mb-6">
              {availableWords.map((word, i) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  className={cn(
                    "text-base h-10 px-3 cursor-pointer bg-card transition-all duration-300",
                    nextWordHint === word && "border-accent ring-2 ring-accent animate-pulse"
                  )} 
                  onClick={() => handleWordClick(word, 'available', i)}
                >
                  {word}
                </Button>
              ))}
            </div>

            <div className="mt-6 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded text-blue-500">help</span>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-300">Ayudas restantes: {helpTokens}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleRevealStart} disabled={helpTokens <= 0}>Revelar Inicio</Button>
                  <Button variant="outline" size="sm" onClick={handleNextWordHint} disabled={helpTokens <= 0 || builtPhrase.length >= currentPhrase.scrambled.length - 1}>Pista</Button>
                </div>
              </div>
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
