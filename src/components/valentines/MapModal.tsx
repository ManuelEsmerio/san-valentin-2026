
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Map, MapPin, X } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

type MapModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onNextChallenge: () => void;
  coordinates: string;
  googleMapsUrl: string;
  iframeUrl: string;
  title?: string;
  description?: ReactNode;
};

export default function MapModal({ 
  isOpen, 
  onClose, 
  onNextChallenge, 
  coordinates, 
  googleMapsUrl, 
  iframeUrl,
  title = "¡Pista de Regalo Desbloqueada!",
  description 
}: MapModalProps) {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsShowing(true);
    } else {
      const timer = setTimeout(() => setIsShowing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isShowing) {
    return null;
  }

  const defaultDescription = (
    <p>
      Felicidades, acabas de superar el primer obstáculo. Todavía quedan más, y tu recompensa es ir a este punto y recoger la pista que necesitas para avanzar.
    </p>
  );

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div
        className={cn(
          'relative w-full max-w-2xl m-4 bg-card text-card-foreground rounded-2xl shadow-2xl shadow-primary/20 border border-primary/10 transition-all duration-300 dark:bg-zinc-900 dark:border-zinc-800',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 h-9 w-9 rounded-full z-10"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </Button>
        <div className="p-6 sm:p-8 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <MapPin className="text-primary h-8 w-8" />
                <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            </div>
            
            <div className="text-muted-foreground mb-4 space-y-3">
              {description || defaultDescription}
            </div>

            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg bg-black/10 border border-border mb-4">
                <iframe
                    src={iframeUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>

            <div className="bg-accent/50 p-4 rounded-lg mb-6">
                <p className="text-lg font-mono text-primary font-bold">
                    {coordinates}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="w-full h-12 text-base font-bold">
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                        <Map className="mr-2" />
                        Abrir en Google Maps
                    </a>
                </Button>
                <Button onClick={onNextChallenge} className="w-full h-12 text-base font-bold">
                    Siguiente Desafío
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
