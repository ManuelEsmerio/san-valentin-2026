"use client";

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// The firework particle effect component
const HeartFirework = ({ baseDelay = 0 }: { baseDelay?: number }) => {
  const animations = [
    'animate-heart-fly-1', 'animate-heart-fly-2', 'animate-heart-fly-3', 'animate-heart-fly-4',
    'animate-heart-fly-5', 'animate-heart-fly-6', 'animate-heart-fly-7', 'animate-heart-fly-8'
  ];

  return (
    <>
      {animations.map((anim, index) => (
        <span
          key={index}
          className={cn(
            'material-symbols-outlined text-primary absolute opacity-0 text-2xl',
            anim
          )}
          style={{ 
            // The total animation is 4s long, this delay is for the start of the infinite loop
            animationDelay: `${baseDelay + index * 75}ms`,
            fontVariationSettings: "'FILL' 1"
          }}
        >
          favorite
        </span>
      ))}
    </>
  );
};

export default function RevelationStage() {
  const collageImg1 = PlaceHolderImages.find((img) => img.id === "letter-1-img-1");
  const collageImg2 = PlaceHolderImages.find((img) => img.id === "letter-1-img-2");
  const collageImg3 = PlaceHolderImages.find((img) => img.id === "letter-1-img-3");

  const [fireworks, setFireworks] = useState<any[]>([]);

  useEffect(() => {
    // This avoids hydration errors by running only on the client
    const generatedFireworks: any[] = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      style: {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      },
      delay: Math.random() * 4000, // Random delay up to 4 seconds for each burst
    }));
    setFireworks(generatedFireworks);
  }, []);


  return (
    <div className="w-full bg-card dark:bg-stone-900 rounded-xl shadow-xl overflow-hidden border border-primary/5 relative">
      
      {/* Container for fireworks to sit on top */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-hidden rounded-xl">
        {fireworks.map(fw => (
            <div key={fw.id} className="absolute" style={fw.style}>
                <HeartFirework baseDelay={fw.delay} />
            </div>
        ))}
      </div>

      {/* Main content, with a lower z-index */}
      <div className="px-4 sm:px-8 pb-10 pt-6 flex flex-col items-center text-center gap-6 z-10 relative">
        <span 
          className="material-symbols-outlined text-primary text-6xl animate-heart-beat"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          favorite
        </span>
        <h2 className="text-foreground text-3xl font-bold leading-tight tracking-[-0.015em]">
          ¡Felicidades, mi chula!
        </h2>
        <p className="text-muted-foreground -mt-4">
          Has llegado al final del desafío.
        </p>
        
        <div className="w-full aspect-[4/3] grid grid-cols-3 grid-rows-2 gap-2">
          {collageImg1 && (
            <div className="col-span-2 row-span-2 relative rounded-lg overflow-hidden shadow-md bg-black/20">
              <Image
                src={collageImg1.imageUrl}
                alt={collageImg1.description}
                data-ai-hint={collageImg1.imageHint}
                fill
                className="object-contain"
              />
            </div>
          )}
          {collageImg2 && (
            <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden shadow-md bg-black/20">
              <Image
                src={collageImg2.imageUrl}
                alt={collageImg2.description}
                data-ai-hint={collageImg2.imageHint}
                fill
                className="object-contain"
              />
            </div>
          )}
          {collageImg3 && (
            <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden shadow-md bg-black/20">
              <Image
                src={collageImg3.imageUrl}
                alt={collageImg3.description}
                data-ai-hint={collageImg3.imageHint}
                fill
                className="object-contain"
              />
            </div>
          )}
        </div>
        
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
