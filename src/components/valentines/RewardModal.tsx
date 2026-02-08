
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type RewardModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function RewardModal({ isOpen, onClose }: RewardModalProps) {
  if (!isOpen) return null;

  const rewardImage = PlaceHolderImages.find((img) => img.id === 'adventure-modal-img');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full p-0 border-primary/20 bg-card overflow-hidden">
        <div className="p-8 text-center flex flex-col items-center gap-4">
          {rewardImage && (
            <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden mb-4 shadow-lg">
               <Image
                  src={rewardImage.imageUrl}
                  alt={rewardImage.description}
                  data-ai-hint={rewardImage.imageHint}
                  fill
                  className="object-cover"
                />
            </div>
          )}
          <DialogTitle className="text-2xl font-bold text-primary">¡Recompensa Desbloqueada!</DialogTitle>
          <div className="text-base text-muted-foreground space-y-3">
            <p>💖 Felicidades, completaste el desafío adicional.</p>
            <p>Ahora, como recompensa especial, tenemos una cita este 27 de marzo en Guadalajara.</p>
            <p>Así que ve buscando un lindo vestido, porque tendremos una velada muy especial en el Hotel Gran Casa Xalisco.</p>
            <p>Será una noche inolvidable ✨💘</p>
          </div>
          <Button onClick={onClose} className="mt-4 w-full max-w-xs h-12 text-lg font-bold">
            Aceptar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
