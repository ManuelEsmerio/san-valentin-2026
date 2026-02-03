'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

type RomanticLetterModalProps = {
  isOpen: boolean;
  letter: {
    title: string;
    content: string[];
    images: ImagePlaceholder[];
  } | null;
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
          'relative w-full max-w-2xl m-4 bg-card text-card-foreground rounded-xl shadow-2xl shadow-primary/20 border border-primary/10 transition-all duration-300',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="p-6 sm:p-8 text-center">
          {letter.images && letter.images.length >= 3 && (
            <div className="mb-6 grid grid-cols-3 grid-rows-2 gap-2 w-full aspect-[4/3]">
              <div className="col-span-2 row-span-2 relative rounded-lg overflow-hidden shadow-md bg-black/20">
                <Image
                  src={`${letter.images[0].imageUrl}?v=1`}
                  alt={letter.images[0].description}
                  data-ai-hint={letter.images[0].imageHint}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden shadow-md bg-black/20">
                <Image
                  src={`${letter.images[1].imageUrl}?v=1`}
                  alt={letter.images[1].description}
                  data-ai-hint={letter.images[1].imageHint}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden shadow-md bg-black/20">
                <Image
                  src={`${letter.images[2].imageUrl}?v=1`}
                  alt={letter.images[2].description}
                  data-ai-hint={letter.images[2].imageHint}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          <span
            className="material-symbols-outlined text-primary text-5xl mb-4"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_florist
          </span>
          <h2 className="text-2xl font-bold text-foreground mb-4">{letter.title}</h2>

          <div className="text-left text-muted-foreground space-y-4 max-h-[30vh] overflow-y-auto pr-2">
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
