'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type CountdownStageProps = {
  onComplete: () => void;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const CountdownUnit = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-6xl md:text-7xl font-bold tracking-tight text-white">
      {value}
    </span>
    <span className="text-xs font-medium uppercase tracking-widest text-white/50">
      {label}
    </span>
  </div>
);

export default function CountdownStage({ onComplete }: CountdownStageProps) {
  const { toast } = useToast();
  const longPressTimer = useRef<NodeJS.Timeout>();

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    const now = new Date();
    let targetYear = now.getFullYear();
    
    // Create a date for Feb 14 of the current year (month is 0-indexed).
    let targetDate = new Date(targetYear, 1, 14, 0, 0, 0);

    // If Feb 14 of this year has already passed, target next year's Feb 14.
    if (now.getTime() > targetDate.getTime()) {
      targetDate.setFullYear(targetYear + 1);
    }

    let timer: NodeJS.Timeout;

    const updateCountdown = () => {
      const now = new Date();
      const difference = +targetDate - +now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsTimeUp(true);
        if(timer) clearInterval(timer);
      }
    };
    
    updateCountdown();
    timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);
  
  // This hook handles both keyboard and touch shortcuts to skip the countdown
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === 'e') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      onComplete();
    }, 4000); // 4 seconds
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleDisabledClick = () => {
    toast({
        title: 'Un poco de paciencia, mi chula',
        description: 'Este regalo se podrá ver cuando el contador llegue a 0.',
    });
  };

  const handleOpenSurprise = () => {
      if(isTimeUp) {
          onComplete();
      } else {
          handleDisabledClick();
      }
  };

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white p-4 text-center bg-gradient-to-br from-[#2a0c14] to-[#1c080d]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJ0cmFuc3BhcmVudCI+PC9yZWN0PjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIHg9IjAiIHk9IjAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiPjwvcmVjdD48L3N2Zz4=')]"></div>
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-bold mb-2">
          Feliz Día de San Valentín
        </h1>
        <h1 className="text-5xl md:text-7xl font-bold text-primary mb-4">
          Mi Chula
        </h1>
        <p className="max-w-md text-white/70 mb-12">
          Cada melodía me recuerda los hermosos momentos que hemos compartido juntos.
        </p>

        {timeLeft && (
          <div className="flex items-center gap-8 md:gap-16 mb-12">
            <CountdownUnit value={formatNumber(timeLeft.days)} label="DÍAS" />
            <CountdownUnit value={formatNumber(timeLeft.hours)} label="HORAS" />
            <CountdownUnit value={formatNumber(timeLeft.minutes)} label="MINUTOS" />
            <CountdownUnit value={formatNumber(timeLeft.seconds)} label="SEGUNDOS" />
          </div>
        )}

        <div className="flex gap-4">
          <Button
            size="lg"
            className={cn(
              "h-12 text-base font-bold bg-primary hover:bg-primary/90 rounded-full px-8 shadow-lg shadow-primary/20",
              !isTimeUp && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleOpenSurprise}
          >
            <Heart className="mr-2 h-5 w-5" fill="white" />
            Abrir Sorpresa
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className={cn(
              "h-12 text-base font-bold text-white/80 hover:bg-white/10 hover:text-white rounded-full px-8",
              !isTimeUp && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleDisabledClick}
          >
            Nuestra Galería
          </Button>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 z-10 text-white/30 text-xs animate-pulse">
        <p>Tip: Mantén presionada la pantalla por 4 segundos o presiona Alt + E para una sorpresa.</p>
      </div>
    </div>
  );
}
