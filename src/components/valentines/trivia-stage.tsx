"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb } from "lucide-react";

type TriviaStageProps = {
  onSuccess: () => void;
};

const triviaQuestions = [
  {
    id: 1,
    question: "¿Dónde fue nuestra primera cita?",
    options: ["Cine", "Café", "Parque"],
    correctAnswer: "Parque",
  },
  {
    id: 2,
    question: "¿Cuál es nuestra canción?",
    options: ["'Perfect' de Ed Sheeran", "'Yellow' de Coldplay", "'Cielito Lindo'"],
    correctAnswer: "'Yellow' de Coldplay",
  },
  {
    id: 3,
    question: "¿Qué es lo que más me gusta de ti?",
    options: ["Tu sonrisa", "Tu forma de ser", "Todo lo anterior"],
    correctAnswer: "Todo lo anterior",
  },
];

export default function TriviaStage({ onSuccess }: TriviaStageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const { toast } = useToast();

  const currentQuestion = triviaQuestions[currentQuestionIndex];

  const handleSubmit = () => {
    if (!selectedAnswer) {
      toast({
        title: "Espera un poquito",
        description: "Debes seleccionar una respuesta.",
      });
      return;
    }

    if (selectedAnswer === currentQuestion.correctAnswer) {
      if (currentQuestionIndex < triviaQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        setFinished(true);
      }
    } else {
      toast({
        variant: "destructive",
        title: "¡Casi!",
        description: "Esa no es, pero estoy seguro de que recuerdas la correcta. 💕",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Paso 3: Trivia de Nuestro Amor
        </CardTitle>
        <CardDescription className="font-body">
          ¿Qué tanto recuerdas de nosotros?
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!finished ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="font-body text-lg font-medium">
                {currentQuestion.question}
              </p>
              <RadioGroup
                onValueChange={setSelectedAnswer}
                value={selectedAnswer || ""}
                className="space-y-2 pt-2"
              >
                {currentQuestion.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="font-body">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <Button onClick={handleSubmit} className="w-full font-headline">
              <Lightbulb className="mr-2 h-4 w-4" /> Responder
            </Button>
          </div>
        ) : (
          <Alert className="animate-fade-in">
            <AlertTitle className="font-headline">
              ¡Perfecto! ¡Sabía que lo sabrías todo!
            </AlertTitle>
            <AlertDescription className="font-body space-y-4">
              <p>
                Has completado el desafío. Ahora, la revelación final...
              </p>
              <Button onClick={onSuccess} className="w-full font-headline">
                Ver mi sorpresa
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
