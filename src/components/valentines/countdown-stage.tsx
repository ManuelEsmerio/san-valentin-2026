'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import FloatingHearts from './FloatingHearts';

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const CountdownUnit = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center space-y-2">
        <div className="glass w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-lg border-primary/20">
            <span className="text-2xl md:text-4xl font-bold text-primary">{value}</span>
        </div>
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-60">{label}</span>
    </div>
);

const ThemeToggle = () => {
    const [theme, setTheme] = useState('light');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light';
        setTheme(storedTheme);
    }, []);

    useEffect(() => {
        if(isMounted) {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
            }
            localStorage.setItem('theme', theme);
        }
    }, [theme, isMounted]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    if (!isMounted) return <div className="w-10 h-10" />;

    return (
        <button 
          className="glass p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-primary transition-colors" 
          onClick={toggleTheme}
        >
            <span className="material-symbols-rounded">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>
    );
};

export default function CountdownStage({ onComplete }: { onComplete: () => void; }) {
  const { toast } = useToast();
  
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSecretTap = useCallback(() => {
    if (tapCountRef.current === 0) {
      tapTimeoutRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 1500);
    }

    tapCountRef.current += 1;

    if (tapCountRef.current >= 6) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    const now = new Date();
    let targetYear = now.getFullYear();
    let targetDate = new Date(targetYear, 1, 14, 0, 0, 0);

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
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === 'e') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-background text-slate-800 dark:text-slate-100 font-sans p-4 text-center"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="absolute top-0 left-0 h-24 w-24 z-50 border-2 border-red-500"
        onClick={handleSecretTap}
        aria-hidden="true"
      />
      <FloatingHearts />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/heart-pattern.png')] pointer-events-none opacity-[0.03] dark:opacity-[0.02]"></div>
      
      <main className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center p-12 md:p-20">
            <div className="absolute inset-0 flex items-center justify-center animate-pulse-glow">
                <svg className="w-full h-full text-primary/10 dark:stroke-primary/30" fill="none" strokeWidth="0.2" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"></path>
                </svg>
            </div>
            <div className="relative z-20 text-center space-y-8 animate-fade-in">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-widest text-slate-900 dark:text-white">
                        Feliz Día de San Valentín
                    </h1>
                    <p className="text-5xl md:text-8xl font-calligraphy text-primary drop-shadow-sm py-2">
                        Mi Chula
                    </p>
                    <p className="text-sm md:text-base opacity-70 max-w-sm mx-auto dark:text-slate-300">
                        Al llegar a cero, descubrirás el desafío que preparé para ti.
                    </p>
                </div>
                {timeLeft && (
                  <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-2xl mx-auto">
                      <CountdownUnit value={formatNumber(timeLeft.days)} label="Días" />
                      <CountdownUnit value={formatNumber(timeLeft.hours)} label="Horas" />
                      <CountdownUnit value={formatNumber(timeLeft.minutes)} label="Minutos" />
                      <CountdownUnit value={formatNumber(timeLeft.seconds)} label="Segundos" />
                  </div>
                )}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
                    <Button
                        onClick={handleOpenSurprise}
                        disabled={!isTimeUp}
                        className="group relative px-8 py-3 bg-primary text-white font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/30 flex items-center gap-2 h-auto text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-rounded text-lg">favorite</span>
                        <span>Abrir Sorpresa</span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </Button>
                    <Button 
                        onClick={handleDisabledClick} 
                        disabled={!isTimeUp}
                        variant="outline"
                        className="px-8 py-3 border-2 border-primary/30 dark:border-primary/50 text-primary dark:text-primary font-bold rounded-full transition-all hover:bg-primary/10 active:scale-95 h-auto text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Nuestra Galería
                    </Button>
                </div>
            </div>
        </div>
      </main>

      <footer className="absolute bottom-6 left-0 right-0 text-center px-4">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Tip: Toca rápidamente una esquina (x6) o presiona Alt + E para una sorpresa.
          </p>
      </footer>
      <div className="absolute bottom-6 left-6 flex gap-2">
          <ThemeToggle />
      </div>
    </div>
  );
}
