'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ChevronLeft, Gift, DoorOpen, Puzzle } from 'lucide-react';

type RiddleModalProps = {
  isOpen: boolean;
  onSuccess: () => void;
  onBack: () => void;
};

// --- Riddle Constants ---
const RIDDLE_TEXT = `No es un lugar público,
solo unos pocos entran.

Ahí descansa, sueña
y guarda lo que más importa.

No se abre con palabras,
pero hoy una llave te guiará.

¿Qué lugar es?`;
const CORRECT_RIDDLE_ANSWERS = ["tu habitacion", "tu habitación"];
const RIDDLE_HINTS = [
    "Es un lugar cotidiano, pero no cualquiera entra sin permiso.",
    "Ahí terminan sus días y comienzan sus sueños.",
    "Tiene una puerta, una cama y hoy guarda tu regalo."
];


export default function RiddleModal({ isOpen, onSuccess, onBack }: RiddleModalProps) {
  const [modalStage, setModalStage] = useState<'riddle' | 'success'>('riddle');
  const [riddleValue, setRiddleValue] = useState('');
  const [riddleHintCount, setRiddleHintCount] = useState(0);

  const [isShowing, setIsShowing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setIsShowing(true);
      // Reset state when modal opens
      setModalStage('riddle');
      setRiddleValue('');
      setRiddleHintCount(0);
    } else {
      const timer = setTimeout(() => setIsShowing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleRiddleSubmit = () => {
    const cleanedAnswer = riddleValue.trim().toLowerCase();
    if (CORRECT_RIDDLE_ANSWERS.includes(cleanedAnswer)) {
      setModalStage('success');
    } else {
      setRiddleValue(''); // Clear input on wrong answer
      if (riddleHintCount < RIDDLE_HINTS.length) {
          toast({
              variant: 'default',
              title: `Pista #${riddleHintCount + 1}`,
              description: RIDDLE_HINTS[riddleHintCount],
          });
          setRiddleHintCount(prev => prev + 1);
      } else {
          toast({
              variant: 'destructive',
              title: 'Casi lo tienes...',
              description: 'Intenta pensar en un lugar muy personal. ¡Vuelve a leer las pistas!'
          })
      }
    }
  };

  if (!isShowing) {
    return null;
  }

  const renderContent = () => {
    switch(modalStage) {
      case 'riddle':
        return (
          <div className="p-6 sm:p-8 text-center animate-fade-in">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Puzzle className="text-primary h-8 w-8" />
              <h2 className="text-2xl font-bold text-foreground">Acertijo Final</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Ya estás en la parte final, solo un poco más. Tienes una llave en tus manos. Para descubrir qué abre, necesitas resolver este acertijo.
            </p>
            <p className="text-muted-foreground mb-6 whitespace-pre-line font-medium text-foreground/90">
              {RIDDLE_TEXT}
            </p>
            <div className="flex flex-col gap-3">
              <Input
                type="text"
                placeholder="¿Qué lugar es?"
                value={riddleValue}
                onKeyDown={(e) => e.key === 'Enter' && handleRiddleSubmit()}
                onChange={(e) => setRiddleValue(e.target.value)}
                className="h-12 text-center text-lg"
              />
              <Button onClick={handleRiddleSubmit} className="w-full h-12 text-lg font-bold">
                Resolver
              </Button>
              <Button variant="outline" onClick={onBack} className="w-full h-12 text-base font-bold">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Volver al Mapa
              </Button>
            </div>
          </div>
        );
      case 'success':
        return (
          <div className="p-6 sm:p-8 text-center animate-fade-in">
              <Gift className="text-primary h-12 w-12 mx-auto mb-4 animate-heart-beat" />
              <h2 className="text-2xl font-bold text-foreground mb-2">¡Correcto! Es tu habitación.</h2>
              <p className="text-muted-foreground mb-6">
                  La llave que te dieron abre la puerta a tu sorpresa final. Tu regalo te está esperando adentro. ¡Ve a descubrirlo!
              </p>
              <Button onClick={onSuccess} className="w-full h-12 text-lg font-bold">
                  <DoorOpen className="mr-2 h-5 w-5" />
                  Ver mi regalo final
              </Button>
          </div>
        );
      default:
        return null;
    }
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
          'relative w-full max-w-2xl m-4 bg-card text-card-foreground rounded-2xl shadow-2xl shadow-primary/20 border border-primary/10 transition-all duration-300 dark:bg-zinc-900 dark:border-zinc-800',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {renderContent()}
      </div>
    </div>
  );
}
