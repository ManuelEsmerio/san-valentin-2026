'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { KeyRound, ChevronLeft, Gift, DoorOpen } from 'lucide-react';

type RiddleModalProps = {
  isOpen: boolean;
  onSuccess: () => void;
  onBack: () => void;
};

const CORRECT_ANSWERS = ["su cuarto", "el cuarto"];
const HINTS = [
  "Pista #1: Es un lugar cotidiano, pero no cualquiera entra sin permiso.",
  "Pista #2: Ahí terminan sus días y comienzan sus sueños.",
  "Pista #3: Tiene una puerta, una cama y hoy guarda tu regalo.",
];

export default function RiddleModal({ isOpen, onSuccess, onBack }: RiddleModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [isShowing, setIsShowing] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setIsShowing(true);
      // Reset state when modal opens
      setInputValue('');
      setWrongAttempts(0);
      setIsSolved(false);
    } else {
      const timer = setTimeout(() => setIsShowing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const cleanedAnswer = inputValue.trim().toLowerCase();
    if (CORRECT_ANSWERS.includes(cleanedAnswer)) {
      setIsSolved(true);
    } else {
      setInputValue(''); // Clear input on wrong answer
      if (wrongAttempts < HINTS.length) {
        toast({
          variant: 'destructive',
          title: 'Respuesta incorrecta. ¡Aquí tienes una pista!',
          description: HINTS[wrongAttempts],
        });
      } else {
        toast({
            variant: 'destructive',
            title: 'Intenta de nuevo',
            description: 'Lee las pistas con atención. ¡Tú puedes!',
        });
      }
      setWrongAttempts(prev => prev + 1);
    }
  };

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
            <div className="p-6 sm:p-8 text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <KeyRound className="text-primary h-8 w-8" />
                    <h2 className="text-2xl font-bold text-foreground">El Acertijo Final</h2>
                </div>
                
                <blockquote className="text-muted-foreground mb-6 italic space-y-2 border-l-2 border-border pl-4 text-left">
                    <p>No es un lugar público, solo unos pocos entran.</p>
                    <p>Ahí descansa, sueña y guarda lo que más importa.</p>
                    <p>No se abre con palabras, pero hoy una llave te guiará.</p>
                    <p className="font-bold text-foreground not-italic pt-2">¿Qué lugar es?</p>
                </blockquote>

                <div className="flex flex-col gap-3">
                    <Input
                    type="text"
                    placeholder="Escribe tu respuesta"
                    value={inputValue}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="h-12 text-center text-lg"
                    />
                    <Button onClick={handleSubmit} className="w-full h-12 text-lg font-bold">
                        Comprobar
                    </Button>
                    <Button variant="outline" onClick={onBack} className="w-full h-12 text-base font-bold">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Volver al Mapa
                    </Button>
                </div>
            </div>
        ) : (
            <div className="p-6 sm:p-8 text-center animate-fade-in">
                <Gift className="text-primary h-12 w-12 mx-auto mb-4 animate-heart-beat" />
                <h2 className="text-2xl font-bold text-foreground mb-2">¡Correcto! Es tu cuarto.</h2>
                <p className="text-muted-foreground mb-6">
                    La llave que te dieron abre la puerta a tu sorpresa final. Tu regalo te está esperando adentro. ¡Ve a descubrirlo!
                </p>
                <Button onClick={onSuccess} className="w-full h-12 text-lg font-bold">
                    <DoorOpen className="mr-2 h-5 w-5" />
                    Ver mi regalo final
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}
