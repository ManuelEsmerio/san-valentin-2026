"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart } from "lucide-react";

type WelcomeStageProps = {
  onSuccess: () => void;
};

export default function WelcomeStage({ onSuccess }: WelcomeStageProps) {
  return (
    <Card>
      <CardHeader className="items-center">
        <Heart className="w-12 h-12 text-primary" />
        <CardTitle className="font-headline text-3xl">
          ¡Bienvenida, mi chula! 💖
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="font-body text-lg mb-6">
          Estás a punto de comenzar un desafío muy especial…
        </p>
        <Button onClick={onSuccess} className="font-headline">
          Comenzar el desafío
        </Button>
      </CardContent>
    </Card>
  );
}
