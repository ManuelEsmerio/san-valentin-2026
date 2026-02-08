
"use client";

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import PhraseGameModal from "./PhraseGameModal";
import RewardModal from "./RewardModal";

export default function RevelationStage({ user }: { user: string | null }) {
  const collage_img1 = PlaceHolderImages.find((img) => img.id === "letter-1-img-1");
  const collage_img2 = PlaceHolderImages.find((img) => img.id === "letter-2-img-1");
  const collage_img3 = PlaceHolderImages.find((img) => img.id === "letter-4-img-1");

  const [isPhraseGameOpen, setPhraseGameOpen] = useState(false);
  const [isRewardModalOpen, setRewardModalOpen] = useState(false);

  const handleReplay = useCallback(() => {
    localStorage.removeItem('valentines-app-stage');
    window.location.reload();
  }, []);

  const handleAllPhrasesCompleted = () => {
    setPhraseGameOpen(false);
    setRewardModalOpen(true);
  };

  return (
    <>
      <main className="relative z-10 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-rose-100 dark:border-rose-900/30">
        <header className="text-center mb-10">
            <div className="inline-block p-3 rounded-full bg-rose-50 dark:bg-rose-900/20 mb-4">
                <span className="material-symbols-rounded text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
                <span className="text-gray-900 dark:text-white">¡Felicidades, </span>
                <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent italic">mi chula!</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase text-sm">Has llegado al final del desafío</p>
        </header>

        <section className="grid grid-cols-[2fr_1fr] grid-rows-[repeat(2,200px)] gap-4 mb-12">
            {collage_img1 && (
                <div className="row-span-2 overflow-hidden rounded-2xl shadow-lg border-4 border-white dark:border-gray-800 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                    <Image
                        src={collage_img1.imageUrl}
                        alt={collage_img1.description}
                        data-ai-hint={collage_img1.imageHint}
                        width={400}
                        height={600}
                        className="w-full h-full object-cover"
                        priority
                    />
                </div>
            )}
            {collage_img2 && (
                <div className="overflow-hidden rounded-2xl shadow-lg border-4 border-white dark:border-gray-800 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                    <Image
                        src={collage_img2.imageUrl}
                        alt={collage_img2.description}
                        data-ai-hint={collage_img2.imageHint}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            {collage_img3 && (
                <div className="overflow-hidden rounded-2xl shadow-lg border-4 border-white dark:border-gray-800 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                    <Image
                        src={collage_img3.imageUrl}
                        alt={collage_img3.description}
                        data-ai-hint={collage_img3.imageHint}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
        </section>

        <article className="bg-[#fdfbf7] dark:bg-gray-800/50 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-8 mb-10 relative">
            <div className="absolute -top-4 -left-4 text-rose-300 dark:text-rose-700 opacity-50">
                <span className="material-symbols-rounded text-6xl">format_quote</span>
            </div>
            <div className="space-y-6 text-gray-700 dark:text-gray-200 leading-relaxed text-lg">
                <p>
                    Este es solo un pequeño recordatorio de lo importante que eres para mí y de lo increíble que es compartir cada momento contigo. Gracias por ser parte de mi vida, por tu cariño, tu paciencia y por todo lo que construimos juntos. ❤️
                </p>
                <p>
                    Sé que estos días han sido de mucho trabajo, pero para nada me olvido de ti. Espero que al menos este detalle te haya sacado una buena sonrisa y te haya ayudado a relajarte un poquito.
                </p>
                <p>
                    Ojalá los desafíos no hayan sido estresantes 🥳, porque quise hacer algo con lo que hago todos los días para darte algo único y especial, algo que solo tú vas a tener. :3
                </p>
            </div>
            <div className="mt-8 text-center">
                <p className="font-handwritten text-4xl text-primary transform -rotate-2">
                    ¡Feliz 14 de Febrero! ❤️
                </p>
            </div>
        </article>

        <div className="flex flex-col items-center gap-4">
            <Button
                onClick={handleReplay}
                variant="outline"
                className="group flex items-center gap-2 px-8 py-3 rounded-full border-2 border-primary/20 text-primary/80 font-semibold hover:bg-primary hover:text-white transition-all duration-300 shadow-md hover:shadow-xl active:scale-95 h-auto text-base"
            >
                <span className="material-symbols-rounded group-hover:rotate-180 transition-transform duration-500">restart_alt</span>
                Volver a vivir la experiencia
            </Button>
             <Button
                onClick={() => setPhraseGameOpen(true)}
                className="group flex items-center gap-2 px-8 py-3 rounded-full bg-accent text-accent-foreground font-semibold hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 h-auto text-base"
            >
                <span className="material-symbols-rounded group-hover:animate-ping">redeem</span>
                Participar por un nuevo regalo adicional...
            </Button>
        </div>
      </main>
      <PhraseGameModal 
        isOpen={isPhraseGameOpen} 
        onClose={() => setPhraseGameOpen(false)}
        onAllPhrasesCompleted={handleAllPhrasesCompleted}
        user={user}
      />
      <RewardModal 
        isOpen={isRewardModalOpen}
        onClose={() => setRewardModalOpen(false)}
      />
    </>
  );
}
