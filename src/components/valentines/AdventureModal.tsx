'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

type AdventureModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
};

// New array of responses
const NO_BUTTON_RESPONSES = [
  "¿Segura?",
  "Intenta otra vez 😅",
  "Ese no cuenta",
  "Más rápida",
  "Casi...",
  "Nop",
  "¡Uy, qué rebelde!",
  "Mejor no...",
  "¿Estás jugando?",
  "Te doy otra chance...",
];

export default function AdventureModal({ isOpen, onConfirm }: AdventureModalProps) {
  const [modalStage, setModalStage] = useState<'question' | 'confirmation'>('question');
  const [noButtonPosition, setNoButtonPosition] = useState({ top: 'auto', left: 'auto' });
  const [noButtonText, setNoButtonText] = useState('No');
  const [noClickCount, setNoClickCount] = useState(0);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [isShowing, setIsShowing] = useState(false);
  
  const adventureImage = PlaceHolderImages.find((img) => img.id === 'adventure-modal-img');

  useEffect(() => {
    if (isOpen) {
      setIsShowing(true);
      // Reset state when modal opens
      setModalStage('question');
      setNoButtonPosition({ top: 'auto', left: 'auto' });
      setNoButtonText('No');
      setNoClickCount(0);
    } else {
      const timer = setTimeout(() => setIsShowing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const moveNoButton = useCallback(() => {
    if (noClickCount >= 10) {
      setNoClickCount(prev => prev + 1); // This will make it 11 and hide the button
      return;
    }
    
    const newCount = noClickCount + 1;
    setNoClickCount(newCount);
    
    if (newCount === 10) {
      setNoButtonText("Una más y me voy...");
    } else {
      const randomIndex = Math.floor(Math.random() * NO_BUTTON_RESPONSES.length);
      setNoButtonText(NO_BUTTON_RESPONSES[randomIndex]);
    }

    if (buttonContainerRef.current) {
      const container = buttonContainerRef.current;
      // Dimensions of the button. Let's make it a bit bigger than the actual button to have some padding.
      const buttonWidth = 120;
      const buttonHeight = 60;

      const newTop = Math.random() * (container.clientHeight - buttonHeight);
      const newLeft = Math.random() * (container.clientWidth - buttonWidth);

      setNoButtonPosition({ top: `${newTop}px`, left: `${newLeft}px` });
    }
  }, [noClickCount]);

  if (!isShowing) {
    return null;
  }
  
  const yesButtonScale = 1 + noClickCount * 0.07;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div
        className={cn(
          'relative w-full max-w-lg m-4 bg-card text-card-foreground rounded-xl shadow-2xl shadow-primary/20 border border-primary/10 transition-all duration-300',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {modalStage === 'question' && (
          <div className="p-6 sm:p-8 text-center">
            {adventureImage && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg bg-black/20 mb-6">
                <Image
                  src={`${adventureImage.imageUrl}?v=2`}
                  alt={adventureImage.description}
                  data-ai-hint={adventureImage.imageHint}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <h2 className="text-2xl font-bold text-foreground mb-6">
              ¿Te gustaría ir conmigo a este viaje?
            </h2>
            <div ref={buttonContainerRef} className="flex flex-col sm:flex-row gap-3 justify-center relative h-40 items-center">
              <Button
                onClick={() => setModalStage('confirmation')}
                className="w-full sm:w-auto h-12 px-10 text-lg font-bold z-10 origin-center transition-transform duration-300 ease-out"
                style={{ transform: `scale(${yesButtonScale})` }}
              >
                Sí
              </Button>
              {noClickCount < 11 && (
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto h-12 px-10 text-lg font-bold transition-all duration-200 ease-out z-20"
                  style={noButtonPosition.top !== 'auto' ? { position: 'absolute', top: noButtonPosition.top, left: noButtonPosition.left } : {}}
                  onMouseEnter={moveNoButton}
                  onClick={moveNoButton} // For touch devices
                >
                  {noButtonText}
                </Button>
              )}
            </div>
          </div>
        )}

        {modalStage === 'confirmation' && (
          <div className="p-6 sm:p-8 text-center animate-fade-in">
             <span
              className="material-symbols-rounded text-primary text-6xl animate-heart-beat mb-4"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Tenemos una cita en nuestro próximo viaje lleno de aventuras 💕
            </h2>
            <Button
              onClick={onConfirm}
              className="mt-6 w-full h-12 text-lg font-bold"
            >
              Seguir
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
