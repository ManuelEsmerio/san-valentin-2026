'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { KeyRound, ChevronLeft } from 'lucide-react';

type KeywordModalProps = {
  isOpen: boolean;
  onSuccess: () => void;
  onBack: () => void;
};

const CORRECT_KEYWORD = "amor";

const ERROR_MESSAGES = [
  {
    title: 'Hey… 😌',
    description: 'Esto no se adivina, se descubre. Sigue jugando.',
  },
  {
    title: 'Mmm… todavía no.',
    description: 'La pista está afuera, no aquí 😉 Inténtalo otra vez.',
  },
  {
    title: 'Casi… pero no 😅',
    description: 'Ve por la pista y vuelve. Te espero aquí.',
  },
];

export default function KeywordModal({ isOpen, onSuccess, onBack }: KeywordModalProps) {
  const [keyword, setKeyword] = useState('');
  const [isShowing, setIsShowing] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setIsShowing(true);
      setKeyword(''); // Reset keyword on open
      setErrorCount(0); // Reset error count on open
    } else {
      const timer = setTimeout(() => setIsShowing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (keyword.trim().toLowerCase() === CORRECT_KEYWORD) {
      onSuccess();
    } else {
      const currentError = ERROR_MESSAGES[errorCount % ERROR_MESSAGES.length];
      toast({
        variant: 'destructive',
        title: currentError.title,
        description: currentError.description,
      });
      setErrorCount(prev => prev + 1);
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
      // No onClick handler on the overlay to prevent closing
    >
      <div
        className={cn(
          'relative w-full max-w-lg m-4 bg-card text-card-foreground rounded-xl shadow-2xl shadow-primary/20 border border-primary/10 transition-all duration-300',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <KeyRound className="text-primary h-8 w-8" />
            <h2 className="text-2xl font-bold text-foreground">Palabra Clave Requerida</h2>
          </div>
          <p className="text-muted-foreground mb-6">
          Para continuar, necesitas la palabra que encontraste en la pista.
          Escríbela aquí para seguir avanzando.
          </p>
          <div className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Ingresa la palabra clave"
              value={keyword}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-12 text-center text-lg"
            />
            <Button onClick={handleSubmit} className="w-full h-12 text-lg font-bold">
              Desbloquear
            </Button>
            <Button variant="outline" onClick={onBack} className="w-full h-12 text-base font-bold">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver a la Pista
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
