'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (audioRef.current) {
      audioRef.current.volume = 0.5; 
    }
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!isMounted) {
    return null; 
  }

  return (
    <>
      <audio ref={audioRef} src="/audio/music.mp3" loop />
      
      <button
        onClick={togglePlayPause}
        className={cn(
          'fixed bottom-6 right-6 z-50 h-14 w-14 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-110 active:scale-100',
          isPlaying && 'animate-pulse'
        )}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        <span className="material-symbols-outlined text-3xl">
          {isPlaying ? 'pause' : 'play_arrow'}
        </span>
      </button>
    </>
  );
}
