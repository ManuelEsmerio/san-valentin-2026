'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type RomanticLetterModalProps = {
  isOpen: boolean;
  letter: { title: string; content: string[] } | null;
  onClose: () => void;
};

export default function RomanticLetterModal({ isOpen, letter, onClose }: RomanticLetterModalProps) {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsShowing(true);
    } else {
      // Allows for exit animation
      const timer = setTimeout(() => setIsShowing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isShowing || !letter) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'opacity-0'
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full max-w-md m-4 bg-card text-card-foreground rounded-xl shadow-2xl shadow-primary/20 border border-primary/10 transition-all duration-300',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="p-6 sm:p-8 text-center">
          <span className="material-symbols-outlined text-primary text-5xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
            local_florist
          </span>
          <h2 className="text-2xl font-bold text-foreground mb-4">{letter.title}</h2>

          <div className="text-left text-muted-foreground space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {letter.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <Button onClick={onClose} className="mt-8 w-full h-12 text-lg font-bold">
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
