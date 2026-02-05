'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const audioEl = audioRef.current;
      if (audioEl) {
        audioEl.volume = 0.5;
        
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        // Set initial state
        setIsPlaying(!audioEl.paused);

        audioEl.addEventListener('play', handlePlay);
        audioEl.addEventListener('pause', handlePause);

        return () => {
          if (audioEl) {
            audioEl.removeEventListener('play', handlePlay);
            audioEl.removeEventListener('pause', handlePause);
          }
        };
      }
    }
  }, [isMounted]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(() => {
        toast({
          variant: 'destructive',
          title: 'No se encontró la música',
          description:
            "Para activar la música, añade un archivo 'music.mp3' en la carpeta 'public/audio'.",
        });
      });
    } else {
      audio.pause();
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <audio ref={audioRef} src="/audio/music.mp3" loop />
      
      <button 
        className="fixed bottom-6 right-6 z-50 group" 
        onClick={togglePlayPause}
        aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
      >
        <div className="glass p-4 rounded-xl flex items-center gap-3 shadow-xl transition-all hover:pr-8">
            <div className="relative w-12 h-12 shrink-0">
                <div className={cn("absolute inset-0 bg-slate-800 rounded-full border-4 border-slate-700 flex items-center justify-center", isPlaying && 'animate-spin-slow')}>
                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <span className="material-symbols-rounded text-[10px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </div>
                </div>
                <div className="absolute -right-1 top-0 w-6 h-1 bg-slate-400 origin-right rotate-[20deg] rounded-full"></div>
            </div>
            <div className="flex flex-col items-start overflow-hidden w-0 group-hover:w-32 transition-all duration-500">
                <span className="text-xs font-bold whitespace-nowrap text-foreground">Fix You - Coldplay</span>
                <span className="text-[10px] opacity-60 whitespace-nowrap text-muted-foreground">{isPlaying ? 'Reproduciendo...' : 'Pausado'}</span>
            </div>
        </div>
      </button>
    </>
  );
}
