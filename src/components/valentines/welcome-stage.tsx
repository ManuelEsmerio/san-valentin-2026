
"use client";

import { Button } from "@/components/ui/button";

type WelcomeStageProps = {
  onSuccess: () => void;
};

export default function WelcomeStage({ onSuccess }: WelcomeStageProps) {
  return (
    <div className="w-full bg-gradient-to-br from-card to-card/70 dark:from-stone-900 dark:to-stone-950 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden border border-primary/5 max-w-md mx-auto">
      <div className="px-4 sm:px-8 py-10 text-center flex flex-col items-center">
        <div className="mb-6 h-20 w-20 rounded-full bg-white dark:bg-stone-800/50 flex items-center justify-center shadow-md">
          <span className="material-symbols-rounded text-primary text-5xl animate-heart-beat" style={{ fontVariationSettings: "'FILL' 1" }}>
            mail
          </span>
        </div>
        <h2 className="text-foreground text-3xl font-bold leading-tight tracking-[-0.015em] mb-4 text-center">
          Antes de empezar… 💌
        </h2>
        <div className="text-muted-foreground text-center mb-8 max-w-sm space-y-4">
            <p>Llevo semanas trabajando en esto para ti. Hubo momentos en los que pensé que no lo iba a terminar… pero aquí está, hecho con todo el corazón. ❤️</p>
        </div>
        
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 text-sm text-primary/80 mb-8 max-w-sm w-full text-left space-y-2">
          <h3 className="font-bold text-center text-primary mb-3">Observaciones importantes:</h3>
          <p>• Necesitarás datos móviles, ya que usarás Google Maps.</p>
          <p>• Ponte ropa y calzado cómodos, vas a caminar un poco.</p>
          <p>• El reto está diseñado para completarse sin prisas.</p>
          <p>• Disfruta cada paso, todo tiene un porqué. ✨</p>
        </div>

        <Button
          onClick={onSuccess}
          className="h-14 px-8 text-lg font-bold shadow-lg shadow-primary/30 rounded-md"
          size="lg"
        >
          <span className="material-symbols-rounded mr-2">
            play_circle
          </span>
          ¡Comenzar Aventura!
        </Button>
      </div>
    </div>
  );
}
