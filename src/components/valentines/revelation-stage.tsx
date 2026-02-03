"use client";

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function RevelationStage() {
  const finalImage = PlaceHolderImages.find((img) => img.id === "couple-photo");

  return (
    <div className="w-full bg-card dark:bg-stone-900 rounded-xl shadow-xl overflow-hidden border border-primary/5">
      <div className="px-4 sm:px-8 pb-10 pt-6 flex flex-col items-center text-center gap-6">
        <span className="material-symbols-outlined text-primary text-6xl animate-heart-beat">
          favorite
        </span>
        <h2 className="text-foreground text-3xl font-bold leading-tight tracking-[-0.015em]">
          ¡Felicidades, mi amor!
        </h2>
        <p className="text-muted-foreground -mt-4">
          Has llegado al final del desafío.
        </p>
        
        {finalImage && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
            <Image
              src={finalImage.imageUrl}
              alt={finalImage.description}
              data-ai-hint={finalImage.imageHint}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="text-center bg-accent/50 p-6 rounded-lg">
          <p className="text-lg md:text-xl">
            Este es solo un pequeño recordatorio de todo lo que significas para
            mí y de lo increíble que es cada momento a tu lado.
          </p>
          <p className="font-headline text-2xl mt-4 text-primary">
            💕 ¡Te amo infinito! 💕
          </p>
        </div>
      </div>
    </div>
  );
}
