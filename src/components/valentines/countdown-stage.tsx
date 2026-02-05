'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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

const FloatingHearts = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="material-symbols-rounded absolute text-coral/30 text-5xl animate-float top-[10%] left-[15%]" style={{ animationDelay: '0s', fontVariationSettings: "'FILL' 1" }}>favorite</span>
        <span className="material-symbols-rounded absolute text-magenta/40 text-7xl animate-float top-[60%] left-[5%]" style={{ animationDelay: '1s', fontVariationSettings: "'FILL' 1" }}>favorite</span>
        <span className="material-symbols-rounded absolute text-gold/30 text-4xl animate-float top-[20%] right-[10%]" style={{ animationDelay: '2s', fontVariationSettings: "'FILL' 1" }}>favorite</span>
        <span className="material-symbols-rounded absolute text-primary/40 text-6xl animate-float bottom-[15%] right-[20%]" style={{ animationDelay: '1.5s', fontVariationSettings: "'FILL' 1" }}>favorite</span>
        <span className="material-symbols-rounded absolute text-coral/20 text-8xl animate-float bottom-[30%] left-[30%]" style={{ animationDelay: '3s', fontVariationSettings: "'FILL' 1" }}>favorite</span>
        <span className="material-symbols-rounded absolute text-gold/20 text-3xl animate-float top-[50%] right-[35%]" style={{ animationDelay: '0.5s', fontVariationSettings: "'FILL' 1" }}>favorite</span>
    </div>
);

const ThemeToggle = () => {
    const [theme, setTheme] = useState('light');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);
    }, []);

    useEffect(() => {
        if(isMounted) {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            localStorage.setItem('theme', theme);
        }
    }, [theme, isMounted]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    if (!isMounted) return <div className="w-10 h-10" />;

    return (
        <button className="glass p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-primary transition-colors" onClick={toggleTheme}>
            <span className="material-symbols-rounded">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>
    );
};

const MusicWidget = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsMounted(true);
        const globalAudio = document.querySelector('audio');
        if (globalAudio) {
            audioRef.current = globalAudio;
            setIsPlaying(!globalAudio.paused);

            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);

            globalAudio.addEventListener('play', handlePlay);
            globalAudio.addEventListener('pause', handlePause);

            return () => {
                globalAudio.removeEventListener('play', handlePlay);
                globalAudio.removeEventListener('pause', handlePause);
            };
        }
    }, []);
    
    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(() => {
                    toast({
                        variant: 'destructive',
                        title: 'No se encontró la música',
                        description: "Para activar la música, añade un archivo 'music.mp3' en la carpeta 'public/audio'.",
                    });
                });
            }
        }
    };
    
    if (!isMounted) return <div className="w-24 h-20" />;

    return (
        <button className="relative group" onClick={togglePlay}>
            <div className="glass p-4 rounded-xl flex items-center gap-3 shadow-xl transition-all hover:pr-8">
                <div className="relative w-12 h-12">
                    <div className={cn("absolute inset-0 bg-slate-800 rounded-full border-4 border-slate-700 flex items-center justify-center", isPlaying && 'animate-spin-slow')}>
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <span className="material-symbols-rounded text-[10px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        </div>
                    </div>
                    <div className="absolute -right-1 top-0 w-6 h-1 bg-slate-400 origin-right rotate-[20deg] rounded-full"></div>
                </div>
                <div className="flex flex-col items-start overflow-hidden w-0 group-hover:w-32 transition-all duration-500">
                    <span className="text-xs font-bold whitespace-nowrap">Fix You - Coldplay</span>
                    <span className="text-[10px] opacity-60 whitespace-nowrap">{isPlaying ? 'Reproduciendo...' : 'Pausado'}</span>
                </div>
            </div>
        </button>
    );
};


export default function CountdownStage({ onComplete }: { onComplete: () => void; }) {
  const { toast } = useToast();
  const longPressTimer = useRef<NodeJS.Timeout>();

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

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

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      onComplete();
    }, 4000);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-background text-slate-800 dark:text-slate-100 font-sans p-4 text-center"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/heart-pattern.png')] pointer-events-none opacity-[0.03] dark:opacity-[0.02]"></div>
      <FloatingHearts />
      
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
                        Cada melodía me recuerda los hermosos momentos que hemos compartido juntos.
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

      <footer className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Tip: Mantén presionada la pantalla por 4 segundos o presiona Alt + E para una sorpresa.
          </p>
      </footer>
      <div className="absolute bottom-6 left-6 flex gap-2">
          <ThemeToggle />
      </div>
      <div className="absolute bottom-6 right-6">
          <MusicWidget />
      </div>
    </div>
  );
}
