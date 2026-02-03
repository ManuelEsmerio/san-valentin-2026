'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

type AdventureModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
};

const NO_BUTTON_RESPONSES = [
  "¿Segura?",
  "Intenta otra vez 😅",
  "Ese no cuenta",
  "Más rápida",
  "Casi...",
  "Nop",
  "¡Uy, qué rebelde!"
];

export default function AdventureModal({ isOpen, onConfirm }: AdventureModalProps) {
  const [modalStage, setModalStage] = useState<'question' | 'confirmation'>('question');
  const [noButtonPosition, setNoButtonPosition] = useState({ top: 'auto', left: 'auto' });
  const [noButtonText, setNoButtonText] = useState('No');
  const modalRef = useRef<HTMLDivElement>(null);
  const [isShowing, setIsShowing] = useState(false);
  
  const adventureImage = PlaceHolderImages.find((img) => img.id === 'adventure-modal-img');

  useEffect(() => {
    if (isOpen) {
      setIsShowing(true);
      // Reset state when modal opens
      setModalStage('question');
      setNoButtonPosition({ top: 'auto', left: 'auto' });
      setNoButtonText('No');
    } else {
      const timer = setTimeout(() => setIsShowing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const moveNoButton = () => {
    if (modalRef.current) {
      const modal = modalRef.current;
      const modalRect = modal.getBoundingClientRect();
      // Use smaller button dimensions to be safe
      const buttonWidth = 80; 
      const buttonHeight = 50;

      const newTop = Math.random() * (modalRect.height - buttonHeight);
      const newLeft = Math.random() * (modalRect.width - buttonWidth);

      setNoButtonPosition({ top: `${newTop}px`, left: `${newLeft}px` });
      
      const randomResponse = NO_BUTTON_RESPONSES[Math.floor(Math.random() * NO_BUTTON_RESPONSES.length)];
      setNoButtonText(randomResponse);
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
    >
      <div
        ref={modalRef}
        className={cn(
          'relative w-full max-w-md m-4 bg-card text-card-foreground rounded-xl shadow-2xl shadow-primary/20 border border-primary/10 transition-all duration-300',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {modalStage === 'question' && (
          <div className="p-6 sm:p-8 text-center">
            {adventureImage && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg bg-black/20 mb-6">
                <Image
                  src={adventureImage.imageUrl}
                  alt={adventureImage.description}
                  data-ai-hint={adventureImage.imageHint}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <h2 className="text-2xl font-bold text-foreground mb-6">
              ¿Te gustaría acompañarme a escribir una nueva historia juntos?
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative h-28 items-center">
              <Button
                onClick={() => setModalStage('confirmation')}
                className="w-full sm:w-auto h-12 px-10 text-lg font-bold z-10"
              >
                Sí
              </Button>
              <Button
                variant="secondary"
                className="w-full sm:w-auto h-12 px-10 text-lg font-bold transition-all duration-200 ease-out z-20"
                style={noButtonPosition.top !== 'auto' ? { position: 'absolute', top: noButtonPosition.top, left: noButtonPosition.left } : {}}
                onMouseEnter={moveNoButton}
                onClick={moveNoButton} // For touch devices
              >
                {noButtonText}
              </Button>
            </div>
          </div>
        )}

        {modalStage === 'confirmation' && (
          <div className="p-6 sm:p-8 text-center animate-fade-in">
             <span
              className="material-symbols-outlined text-primary text-6xl animate-heart-beat mb-4"
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
