"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Heart } from "lucide-react";

export default function RevelationStage() {
  const finalImage = PlaceHolderImages.find((img) => img.id === "couple-photo");

  return (
    <Card className="overflow-hidden">
      <CardHeader className="items-center text-center">
        <Heart className="w-12 h-12 text-primary animate-heart-beat" />
        <CardTitle className="font-headline text-3xl">
          ¡Felicidades, mi amor!
        </CardTitle>
        <CardDescription className="font-body">
          Has llegado al final del desafío.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        {finalImage && (
          <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden shadow-lg">
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
          <p className="font-body text-lg md:text-xl">
            Este es solo un pequeño recordatorio de todo lo que significas para
            mí y de lo increíble que es cada momento a tu lado.
          </p>
          <p className="font-headline text-2xl mt-4 text-primary">
            💕 ¡Te amo infinito! 💕
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
