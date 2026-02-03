"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, RotateCcw } from "lucide-react";
import { Progress } from "../ui/progress";
import RomanticLetterModal from "./RomanticLetterModal";

type TriviaStageProps = {
  onSuccess: () => void;
};

type MultipleChoiceQuestion = {
  id: number;
  type: "multiple-choice";
  question: string;
  options: string[];
  correctAnswer: string;
};

type OpenEndedQuestion = {
  id: number;
  type: "open-ended";
  question: string;
};

type TriviaQuestion = MultipleChoiceQuestion | OpenEndedQuestion;

const multipleChoiceQuestions: MultipleChoiceQuestion[] = [
    { id: 1, type: "multiple-choice", question: "¿Dónde nos conocimos por primera vez?", options: ["En la casa", "En lagos de moreno", "En el terreno"], correctAnswer: "En el terreno" },
    { id: 2, type: "multiple-choice", question: "¿Cuál fue nuestro primer viaje juntos (Acompañados entre amigos)?", options: ["Mazamitla", "La Huasteca Potosina", "Guadalajara"], correctAnswer: "La Huasteca Potosina" },
    { id: 3, type: "multiple-choice", question: "¿Qué día celebramos nuestro aniversario?", options: ["13 de Febrero", "13 de Abril", "13 de Marzo"], correctAnswer: "13 de Abril" },
    { id: 4, type: "multiple-choice", question: "¿Cuál es mi comida favorita?", options: ["Mariscos", "Tacos", "Hamburguesas"], correctAnswer: "Mariscos" },
    { id: 5, type: "multiple-choice", question: "¿Qué es lo que más nos gusta hacer juntos?", options: ["Ver películas", "Viajar", "Todo lo anterior"], correctAnswer: "Todo lo anterior" },
    { id: 6, type: "multiple-choice", question: "¿Quién se duerme primero casi siempre?", options: ["Yo", "Tú", "Los dos al mismo tiempo"], correctAnswer: "Yo" },
    { id: 7, type: "multiple-choice", question: "¿Qué apodo usamos más entre nosotros?", options: ["Amor", "Mi chula", "Bebé"], correctAnswer: "Mi chula" },
    { id: 8, type: "multiple-choice", question: "¿Cuál fue nuestro ultimo viaje juntos?", options: ["Playa", "Pueblo mágico", "Ciudad cercana"], correctAnswer: "Playa" },
    { id: 9, type: "multiple-choice", question: "¿Qué es lo que más valoro de nuestra relación?", options: ["La confianza", "La comunicación", "Todo lo anterior"], correctAnswer: "Todo lo anterior" },
    { id: 10, type: "multiple-choice", question: "¿Cómo describirías nuestra relación?", options: ["Divertida", "Única", "Ambas"], correctAnswer: "Ambas" },
];

const openEndedQuestions: OpenEndedQuestion[] = [
    { id: 11, type: "open-ended", question: "¿Qué fue lo primero que te hizo sentir algo especial por mí?" },
    { id: 12, type: "open-ended", question: "¿Qué es lo que más te gusta de nosotros como pareja?" },
];

const LETTERS = {
  1: {
    title: 'Lo que más amo de ti…',
    content: [
      'Tu sonrisa, tu cariño y tu manera tan hermosa de querer hacen que cada día valga la pena. 💖',
      'Aunque a veces no estemos de acuerdo y peleemos, yo te elijo a ti.',
      'Gracias por tu paciencia, por entenderme cuando me cuesta explicarme, por quedarte incluso cuando no es fácil y por elegirnos una y otra vez.',
      'A tu lado aprendí que el amor también es calma, apoyo y complicidad, y que también son pláticas incómodas, discusiones y peleas, pero siempre volver a escogernos.',
    ],
  },
  2: {
    title: 'Mi recuerdo más preciado…',
    content: [
      'Tal vez no fue perfecto, pero fue real.',
      'Los días que me quedé en Lagos solo con tal de verte, cuando todavía no conocía nada, pero sí tenía claro que quería conocerte a ti.',
      'Tanto, que dormí en el suelo en casa de Edgar, hicimos carne asada y fueron días muy bonitos que siempre voy a apreciar profundamente.',
      'Desde ese momento supe que algo especial estaba empezando entre nosotros. ✨',
    ],
  },
  3: {
    title: 'Lo que quiero contigo…',
    content: [
      'Compartir risas, crear más recuerdos y seguir eligiéndonos todos los días,',
      'en los días malos, cuando estemos cansados y sintamos que no podemos más, saber que estamos el uno para el otro, para apoyarnos y darnos la mano en esos momentos, sin importar lo que venga. 💕',
    ],
  },
};

const MIN_CORRECT_ANSWERS = 8;

const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

export default function TriviaStage({ onSuccess }: TriviaStageProps) {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [stage, setStage] = useState<"playing" | "failed" | "finished">("playing");
  const { toast } = useToast();
  
  const [letterToShow, setLetterToShow] = useState<{ title: string; content: string[] } | null>(null);
  const [shownLetters, setShownLetters] = useState<Record<number, boolean>>({});

  const setupTrivia = () => {
    const shuffledMcq = shuffleArray([...multipleChoiceQuestions]);
    setQuestions([...shuffledMcq, ...openEndedQuestions]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setStage("playing");
    setShownLetters({});
  };

  useEffect(() => {
    setupTrivia();
  }, []);
  
  useEffect(() => {
    if (stage !== "playing") return;

    const score = multipleChoiceQuestions.reduce((acc, q) => 
        answers[q.id] === q.correctAnswer ? acc + 1 : acc, 0);

    if (score === 3 && !shownLetters[1]) {
        setLetterToShow(LETTERS[1]);
        setShownLetters(prev => ({ ...prev, 1: true }));
    } else if (score === 6 && !shownLetters[2]) {
        setLetterToShow(LETTERS[2]);
        setShownLetters(prev => ({ ...prev, 2: true }));
    } else if (score === 9 && !shownLetters[3]) {
        setLetterToShow(LETTERS[3]);
        setShownLetters(prev => ({ ...prev, 3: true }));
    }
  }, [answers, shownLetters, stage]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    const currentAnswer = answers[currentQuestion.id];
    if (!currentAnswer || currentAnswer.trim() === "") {
        toast({
            title: "Espera un poquito",
            description: "Debes responder la pregunta.",
        });
        return;
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      let score = 0;
      multipleChoiceQuestions.forEach(q => {
        if(answers[q.id] === q.correctAnswer) {
          score++;
        }
      });
      
      if (score >= MIN_CORRECT_ANSWERS) {
        setStage("finished");
      } else {
        setStage("failed");
      }
    }
  };

  const handleRetry = () => {
    setupTrivia();
  };
  
  if (stage === "failed") {
    return (
      <div className="w-full bg-card rounded-xl shadow-xl overflow-hidden border border-primary/5">
        <div className="px-4 sm:px-8 pb-10 pt-6 text-center">
            <Alert className="animate-fade-in text-center border-destructive/50 text-destructive">
                <span className="material-symbols-outlined text-5xl">
                    sentiment_dissatisfied
                </span>
                <AlertTitle className="font-headline mt-2 text-xl">
                    ¡Oh no! No pasaste la prueba.
                </AlertTitle>
                <AlertDescription className="font-body space-y-4 mt-4 text-foreground/80">
                    <p>
                        Pero no te preocupes, el amor es también dar segundas oportunidades. ¡Inténtalo de nuevo!
                    </p>
                    <Button onClick={handleRetry} className="w-full h-12 text-lg font-bold">
                        <RotateCcw className="mr-2 h-4 w-4" /> Reintentar
                    </Button>
                </AlertDescription>
            </Alert>
        </div>
      </div>
    )
  }

  if (stage === "finished") {
     return (
        <div className="w-full bg-card rounded-xl shadow-xl overflow-hidden border border-primary/5">
            <div className="px-4 sm:px-8 pb-10 pt-6">
                <Alert className="animate-fade-in text-center border-green-500/50">
                    <span className="material-symbols-outlined text-primary text-5xl">
                        check_circle
                    </span>
                    <AlertTitle className="font-headline mt-2 text-xl text-green-600">
                        ¡Perfecto! ¡Sabía que lo sabrías todo!
                    </AlertTitle>
                    <AlertDescription className="font-body space-y-4 mt-4 text-foreground/80">
                    <p>
                        Has completado el desafío. Ahora, la revelación final...
                    </p>
                    <Button onClick={onSuccess} className="w-full h-12 text-lg font-bold">
                        Ver mi sorpresa
                    </Button>
                    </AlertDescription>
                </Alert>
            </div>
        </div>
      )
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="w-full bg-card rounded-xl shadow-xl overflow-hidden border border-primary/5">
      <div className="p-4">
        <Progress value={progress} className="h-2"/>
        <p className="text-center text-sm text-muted-foreground mt-2">Pregunta {currentQuestionIndex + 1} de {questions.length}</p>
      </div>
      <div className="px-4 sm:px-8 pb-10 pt-2">
          <div className="space-y-6">
            <div className="space-y-2 min-h-[200px]">
              <p className="font-body text-lg font-medium text-center">
                {currentQuestion.question}
              </p>
              
              {currentQuestion.type === 'multiple-choice' && (
                <RadioGroup
                    onValueChange={handleAnswerChange}
                    value={answers[currentQuestion.id] || ""}
                    className="space-y-2 pt-4"
                >
                    {(currentQuestion as MultipleChoiceQuestion).options.map((option) => (
                    <Label 
                        key={option} 
                        htmlFor={option} 
                        className="flex items-center space-x-3 p-4 rounded-lg border border-border has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 cursor-pointer"
                    >
                        <RadioGroupItem value={option} id={option} />
                        <span className="font-body text-base">{option}</span>
                    </Label>
                    ))}
                </RadioGroup>
              )}

              {currentQuestion.type === 'open-ended' && (
                 <div className="pt-4">
                    <Textarea 
                        placeholder="Escribe tu respuesta aquí, mi amor..."
                        className="min-h-[120px] text-base"
                        value={answers[currentQuestion.id] || ""}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                    />
                 </div>
              )}
            </div>

            <Button onClick={handleNext} className="w-full h-12 text-lg font-bold">
              <Lightbulb className="mr-2 h-4 w-4" /> 
              {currentQuestionIndex < questions.length - 1 ? 'Siguiente' : 'Finalizar Trivia'}
            </Button>
          </div>
      </div>
      <RomanticLetterModal
          isOpen={!!letterToShow}
          letter={letterToShow}
          onClose={() => setLetterToShow(null)}
        />
    </div>
  );
}
