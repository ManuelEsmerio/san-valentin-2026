"use client";

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import AdventureModal from "./AdventureModal";

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
  const collage1_img1 = PlaceHolderImages.find((img) => img.id === "letter-1-img-1");
  const collage1_img2 = PlaceHolderImages.find((img) => img.id === "letter-1-img-2");
  const collage1_img3 = PlaceHolderImages.find((img) => img.id === "letter-1-img-3");

  const collage2_img1 = PlaceHolderImages.find((img) => img.id === "letter-2-img-1");
  const collage2_img2 = PlaceHolderImages.find((img) => img.id === "letter-2-img-2");
  const collage2_img3 = PlaceHolderImages.find((img) => img.id === "letter-2-img-3");

  const collage3_img1 = PlaceHolderImages.find((img) => img.id === "letter-3-img-1");
  const collage3_img2 = PlaceHolderImages.find((img) => img.id === "letter-3-img-2");
  const collage3_img3 = PlaceHolderImages.find((img) => img.id === "letter-3-img-3");

  const collage4_img1 = PlaceHolderImages.find((img) => img.id === "letter-4-img-1");
  const collage4_img2 = PlaceHolderImages.find((img) => img.id === "letter-4-img-2");
  const collage4_img3 = PlaceHolderImages.find((img) => img.id === "letter-4-img-3");

  const [fireworks, setFireworks] = useState<any[]>([]);
  const [isAdventureModalOpen, setAdventureModalOpen] = useState(false);

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

  const handleReplay = () => {
    localStorage.removeItem('valentines-app-stage');
    window.location.reload();
  };

  return (
    <>
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
          
          <Carousel
            opts={{ loop: true }}
            className="w-full max-w-md"
          >
            <CarouselContent>
              {/* Slide 1 */}
              <CarouselItem>
                <div className="p-1">
                  <div className="w-full aspect-[4/3] grid grid-cols-3 grid-rows-2 gap-2">
                    {collage1_img1 && (
                      <div className="col-span-2 row-span-2 relative rounded-lg overflow-hidden shadow-md bg-black/20">
                        <Image
                          src={collage1_img1.imageUrl}
                          alt={collage1_img1.description}
                          data-ai-hint={collage1_img1.imageHint}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    {collage1_img2 && (
                      <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden shadow-md bg-black/20">
                        <Image
                          src={collage1_img2.imageUrl}
                          alt={collage1_img2.description}
                          data-ai-hint={collage1_img2.imageHint}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    {collage1_img3 && (
                      <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden shadow-md bg-black/20">
                        <Image
                          src={collage1_img3.imageUrl}
                          alt={collage1_img3.description}
                          data-ai-hint={collage1_img3.imageHint}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
              
              {/* Slide 2 */}
              <CarouselItem>
                <div className="p-1">
                  <div className="w-full aspect-[4/3] grid grid-cols-3 grid-rows-2 gap-2">
                    {collage2_img1 && (
                      <div className="col-span-1 row-span-2 relative rounded-lg overflow-hidden shadow-md bg-black/20">
                        <Image
                          src={collage2_img1.imageUrl}
                          alt={collage2_img1.description}
                          data-ai-hint={collage2_img1.imageHint}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    {collage2_img2 && (
                      <div className="col-span-2 row-span-1 relative rounded-lg overflow-hidden shadow-md bg-black/20">
                        <Image
                          src={collage2_img2.imageUrl}
                          alt={collage2_img2.description}
                          data-ai-hint={collage2_img2.imageHint}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    {collage2_img3 && (
                      <div className="col-span-2 row-span-1 relative rounded-lg overflow-hidden shadow-md bg-black/20">
                        <Image
                          src={collage2_img3.imageUrl}
                          alt={collage2_img3.description}
                          data-ai-hint={collage2_img3.imageHint}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
              
              {/* Slide 3 */}
              <CarouselItem>
                <div className="p-1">
                  <div className="w-full aspect-[4/3] grid grid-cols-2 grid-rows-2 gap-2">
                    {collage3_img1 && (
                      <div className="col-span-2 row-span-1 relative rounded-lg overflow-hidden shadow-md bg-black/20">
                        <Image
                          src={collage3_img1.imageUrl}
                          alt={collage3_img1.description}
                          data-ai-hint={collage3_img1.imageHint}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    {collage3_img2 && (
                      <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden shadow-md bg-black/20">
                        <Image
                          src={collage3_img2.imageUrl}
                          alt={collage3_img2.description}
                          data-ai-hint={collage3_img2.imageHint}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    {collage3_img3 && (
                      <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden shadow-md bg-black/20">
                        <Image
                          src={collage3_img3.imageUrl}
                          alt={collage3_img3.description}
                          data-ai-hint={collage3_img3.imageHint}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 4 */}
              <CarouselItem>
                <div className="p-1">
                  <div className="w-full aspect-[4/3] grid grid-cols-2 grid-rows-2 gap-2">
                    {collage4_img1 && (
                      <div className="col-span-2 row-span-1 relative rounded-lg overflow-hidden shadow-md bg-black/20">
                        <Image
                          src={collage4_img1.imageUrl}
                          alt={collage4_img1.description}
                          data-ai-hint={collage4_img1.imageHint}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    {collage4_img2 && (
                      <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden shadow-md bg-black/20">
                        <Image
                          src={collage4_img2.imageUrl}
                          alt={collage4_img2.description}
                          data-ai-hint={collage4_img2.imageHint}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    {collage4_img3 && (
                      <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden shadow-md bg-black/20">
                        <Image
                          src={collage4_img3.imageUrl}
                          alt={collage4_img3.description}
                          data-ai-hint={collage4_img3.imageHint}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex left-2" />
            <CarouselNext className="hidden sm:flex right-2" />
          </Carousel>
          
          <div className="text-center bg-accent/50 p-6 rounded-lg">
            <p className="text-lg md:text-xl">
              Este es solo un pequeño recordatorio de todo lo que significas para
              mí y de lo increíble que es cada momento a tu lado.
            </p>
            <p className="font-headline text-2xl mt-4 text-primary">
              💕 ¡Te amo infinito! 💕
            </p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4 w-full max-w-sm">
            <Button
              variant="outline"
              onClick={handleReplay}
              className="w-full h-12 text-base font-bold"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Volver a vivir la experiencia
            </Button>
            <Button
              onClick={() => setAdventureModalOpen(true)}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-rose-400 text-white shadow-lg shadow-primary/30"
            >
              <span 
                className="material-symbols-outlined mr-2 animate-heart-beat" 
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                card_giftcard
              </span>
              ¡Regalo sorpresa!
            </Button>
          </div>
        </div>
      </div>
      <AdventureModal 
        isOpen={isAdventureModalOpen}
        onConfirm={() => setAdventureModalOpen(false)}
      />
    </>
  );
}
