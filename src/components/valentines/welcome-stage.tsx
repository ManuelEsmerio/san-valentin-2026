"use client";

import { Button } from "@/components/ui/button";

type WelcomeStageProps = {
  onSuccess: () => void;
};

export default function WelcomeStage({ onSuccess }: WelcomeStageProps) {
  return (
    <div className="w-full bg-card dark:bg-stone-900 rounded-xl shadow-xl overflow-hidden border border-primary/5">
      <div className="px-4 sm:px-8 py-10 text-center">
        <div className="flex justify-center mb-4">
          <span className="material-symbols-outlined text-primary text-6xl animate-heart-beat">
            favorite
          </span>
        </div>
        <h2 className="text-foreground text-3xl font-bold leading-tight tracking-[-0.015em] mb-2 text-center">
          ¡Bienvenida, mi chula! 💖
        </h2>
        <p className="text-muted-foreground text-center mb-8 text-lg">
          Estás a punto de comenzar un desafío muy especial…
        </p>
        <Button
          onClick={onSuccess}
          className="h-14 px-8 text-lg font-bold shadow-lg shadow-primary/20"
        >
          Comenzar el desafío
        </Button>
      </div>
    </div>
  );
}
