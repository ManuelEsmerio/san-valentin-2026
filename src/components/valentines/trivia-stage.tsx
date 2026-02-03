"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Heart, Lightbulb, RotateCcw, XCircle } from "lucide-react";
import { Progress } from "../ui/progress";
import RomanticLetterModal from "./RomanticLetterModal";
import { PlaceHolderImages, type ImagePlaceholder } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

type TriviaStageProps = {
  onSuccess: () => void;
};

type MultipleChoiceQuestion = {
  id: number;
  type: "multiple-choice";
  question: string;
  options: string[];
  correctAnswer: string;
  image: string;
  hint: string;
  category?: string;
};

type OpenEndedQuestion = {
  id: number;
  type: "open-ended";
  question: string;
  image: string;
  hint: string;
};

type TriviaQuestion = MultipleChoiceQuestion | OpenEndedQuestion;
type AnswerStatus = "unanswered" | "correct" | "incorrect";

const multipleChoiceQuestions: MultipleChoiceQuestion[] = [
    { id: 1, type: "multiple-choice", question: "¿Dónde nos conocimos por primera vez?", options: ["En la casa", "En lagos de moreno", "En el terreno"], correctAnswer: "En el terreno", image: 'trivia-1', hint: "Fue un lugar al aire libre, con mucha tierra." },
    { id: 2, type: "multiple-choice", question: "¿Cuál fue nuestro primer viaje juntos (Acompañados entre amigos)?", options: ["Mazamitla", "La Huasteca Potosina", "Guadalajara"], correctAnswer: "La Huasteca Potosina", image: 'trivia-2', hint: "Cascadas y paisajes verdes.", category: "Viaje Inolvidable" },
    { id: 3, type: "multiple-choice", question: "¿Qué día celebramos nuestro aniversario?", options: ["13 de Febrero", "13 de Abril", "13 de Marzo"], correctAnswer: "13 de Abril", image: 'trivia-3', hint: "El mes de la primavera." },
    { id: 4, type: "multiple-choice", question: "¿Cuál es mi comida favorita?", options: ["Mariscos", "Tacos", "Hamburguesas"], correctAnswer: "Mariscos", image: 'trivia-4', hint: "Viene del mar." },
    { id: 5, type: "multiple-choice", question: "¿Qué es lo que más nos gusta hacer juntos?", options: ["Ver películas", "Viajar", "Todo lo anterior"], correctAnswer: "Todo lo anterior", image: 'trivia-5', hint: "Cualquier cosa, pero juntos." },
    { id: 6, type: "multiple-choice", question: "¿Quién se duerme primero casi siempre?", options: ["Yo", "Tú", "Los dos al mismo tiempo"], correctAnswer: "Yo", image: 'trivia-6', hint: "El que madruga..." },
    { id: 7, type: "multiple-choice", question: "¿Qué apodo usamos más entre nosotros?", options: ["Amor", "Mi chula", "Bebé"], correctAnswer: "Mi chula", image: 'trivia-7', hint: "Es corto y muy dulce." },
    { id: 8, type: "multiple-choice", question: "¿Cuál fue nuestro ultimo viaje juntos?", options: ["Playa", "Pueblo mágico", "Ciudad cercana"], correctAnswer: "Playa", image: 'trivia-8', hint: "Sol, arena y mar.", category: "Aventura Reciente" },
    { id: 9, type: "multiple-choice", question: "¿Qué es lo que más valoro de nuestra relación?", options: ["La confianza", "La comunicación", "Todo lo anterior"], correctAnswer: "Todo lo anterior", image: 'trivia-9', hint: "Es la base de todo." },
    { id: 10, type: "multiple-choice", question: "¿Cómo describirías nuestra relación?", options: ["Divertida", "Única", "Ambas"], correctAnswer: "Ambas", image: 'trivia-10', hint: "Somos un equipo." },
];

const openEndedQuestions: OpenEndedQuestion[] = [
    { id: 11, type: "open-ended", question: "¿Qué fue lo primero que te hizo sentir algo especial por mí?", image: 'open-ended-1', hint: "Piensa en nuestros inicios..." },
    { id: 12, type: "open-ended", question: "¿Qué es lo que más te gusta de nosotros como pareja?", image: 'open-ended-2', hint: "Lo que nos hace... nosotros." },
];

const LETTERS = {
  3: {
    title: "Lo que más amo de ti…",
    content: [
      "Tu sonrisa, tu cariño y tu manera tan hermosa de querer hacen que cada día valga la pena. 💖",
      "Aunque a veces no estemos de acuerdo y peleemos, yo te elijo a ti.",
      "Gracias por tu paciencia, por entenderme cuando me cuesta explicarme, por quedarte incluso cuando no es fácil y por elegirnos una y otra vez.",
      "A tu lado aprendí que el amor también es calma, apoyo y complicidad, y que también son pláticas incómodas, discusiones y peleas, pero siempre volver a escogernos.",
    ],
    imageIds: ["letter-1-img-1", "letter-1-img-2", "letter-1-img-3"],
  },
  6: {
    title: "Mi recuerdo más preciado…",
    content: [
      "Tal vez no fue perfecto, pero fue real.",
      "Los días que me quedé en Lagos solo con tal de verte, cuando todavía no conocía nada, pero sí tenía claro que quería conocerte a ti.",
      "Tanto, que dormí en el suelo en casa de Edgar, hicimos carne asada y fueron días muy bonitos que siempre voy a apreciar profundamente.",
      "Desde ese momento supe que algo especial estaba empezando entre nosotros. ✨",
    ],
    imageIds: ["letter-2-img-1", "letter-2-img-2", "letter-2-img-3"],
  },
  9: {
    title: "Lo que quiero contigo…",
    content: [
      "Compartir risas, crear más recuerdos y seguir eligiéndonos todos los días,",
      "en los días malos, cuando estemos cansados y sintamos que no podemos más, saber que estamos el uno para el otro, para apoyarnos y darnos la mano en esos momentos, sin importar lo que venga. 💕",
    ],
    imageIds: ["letter-3-img-1", "letter-3-img-2", "letter-3-img-3"],
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
  const [score, setScore] = useState(0);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>('unanswered');
  const [stage, setStage] = useState<"playing" | "failed" | "finished">("playing");
  const { toast } = useToast();
  
  const [letterToShow, setLetterToShow] = useState<{ title: string; content: string[]; images: ImagePlaceholder[] } | null>(null);
  const [shownLetters, setShownLetters] = useState<Record<number, boolean>>({});

  const setupTrivia = () => {
    const shuffledMcq = shuffleArray([...multipleChoiceQuestions]);
    setQuestions([...shuffledMcq, ...openEndedQuestions]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setAnswerStatus('unanswered');
    setStage("playing");
    setShownLetters({});
  };

  useEffect(() => {
    setupTrivia();
  }, []);
  
  useEffect(() => {
    if (stage !== "playing") return;

    if (score > 0 && LETTERS[score as keyof typeof LETTERS] && !shownLetters[score]) {
        const letterData = LETTERS[score as keyof typeof LETTERS];
        const letterImages = letterData.imageIds
          .map(id => PlaceHolderImages.find(img => img.id === id))
          .filter((img): img is ImagePlaceholder => !!img);
          
        setLetterToShow({ ...letterData, images: letterImages });
        setShownLetters(prev => ({ ...prev, [score]: true }));
    }
  }, [score, shownLetters, stage]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;
  const imagePlaceholder = PlaceHolderImages.find(img => img.id === currentQuestion?.image);


  const handleAnswerChange = (value: string) => {
    if (answerStatus !== 'unanswered') return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    // If we are showing feedback, move to the next question
    if (answerStatus !== 'unanswered') {
      setAnswerStatus('unanswered');
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        if (score >= MIN_CORRECT_ANSWERS) {
          setStage("finished");
        } else {
          setStage("failed");
        }
      }
      return;
    }

    // If it's an open-ended question, just move to the next one
    if (currentQuestion.type === 'open-ended') {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
         if (score >= MIN_CORRECT_ANSWERS) {
          setStage("finished");
        } else {
          setStage("failed");
        }
      }
      return;
    }

    const currentAnswer = answers[currentQuestion.id];
    if (!currentAnswer) {
        toast({ title: "Espera un poquito", description: "Debes seleccionar una respuesta." });
        return;
    }
    
    if (currentAnswer === (currentQuestion as MultipleChoiceQuestion).correctAnswer) {
        setScore(prev => prev + 1);
        setAnswerStatus('correct');
    } else {
        setAnswerStatus('incorrect');
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
                <span className="material-symbols-outlined text-5xl">sentiment_dissatisfied</span>
                <AlertTitle className="font-headline mt-2 text-xl">¡Oh no! No pasaste la prueba.</AlertTitle>
                <AlertDescription className="font-body space-y-4 mt-4 text-foreground/80">
                    <p>Obtuviste {score} de {multipleChoiceQuestions.length}. Pero no te preocupes, el amor es también dar segundas oportunidades. ¡Inténtalo de nuevo!</p>
                    <Button onClick={handleRetry} className="w-full h-12 text-lg font-bold"><RotateCcw className="mr-2 h-4 w-4" /> Reintentar</Button>
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
                    <span className="material-symbols-outlined text-primary text-5xl">check_circle</span>
                    <AlertTitle className="font-headline mt-2 text-xl text-green-600">¡Perfecto! ¡Sabía que lo sabrías todo!</AlertTitle>
                    <AlertDescription className="font-body space-y-4 mt-4 text-foreground/80">
                    <p>Has completado el desafío. Ahora, la revelación final...</p>
                    <Button onClick={onSuccess} className="w-full h-12 text-lg font-bold">Ver mi sorpresa</Button>
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
    <div className="w-full flex flex-col gap-6 items-center">
      <div className="w-full bg-card rounded-xl shadow-xl overflow-hidden border border-primary/5">
        {imagePlaceholder && (
          <div className="relative w-full aspect-[21/9] rounded-t-xl overflow-hidden">
            <Image
              src={imagePlaceholder.imageUrl}
              alt={imagePlaceholder.description}
              data-ai-hint={imagePlaceholder.imageHint}
              fill
              className="object-cover"
              priority
            />
            {currentQuestion.type === "multiple-choice" && currentQuestion.category && (
              <div className="absolute bottom-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                {currentQuestion.category}
              </div>
            )}
          </div>
        )}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-2">{currentQuestion.question}</h2>
          <p className="text-center text-muted-foreground mb-6">{currentQuestion.hint}</p>

          {currentQuestion.type === 'multiple-choice' && (
            <RadioGroup
              onValueChange={handleAnswerChange}
              value={answers[currentQuestion.id] || ""}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              disabled={answerStatus !== 'unanswered'}
            >
              {(currentQuestion as MultipleChoiceQuestion).options.map((option) => (
                <Label 
                  key={option} 
                  htmlFor={option} 
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border-2 border-border has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 cursor-pointer transition-all",
                    answerStatus !== 'unanswered' && (currentQuestion as MultipleChoiceQuestion).correctAnswer === option && "border-green-500 bg-green-500/5",
                    answerStatus === 'incorrect' && answers[currentQuestion.id] === option && "border-destructive bg-destructive/5"
                  )}
                >
                  <RadioGroupItem value={option} id={option} disabled={answerStatus !== 'unanswered'} />
                  <span className="font-body text-base flex-1">{option}</span>
                </Label>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === 'open-ended' && (
            <div className="pt-2">
              <Textarea 
                placeholder="Escribe tu respuesta aquí, mi amor..."
                className="min-h-[120px] text-base"
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {answerStatus !== 'unanswered' && (
        <div className={cn(
          "w-full p-4 rounded-lg flex items-center gap-4 animate-fade-in",
          answerStatus === 'correct' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
        )}>
          {answerStatus === 'correct' ? <CheckCircle2 /> : <XCircle />}
          <div className="flex-1">
            <h4 className="font-bold">{answerStatus === 'correct' ? "¡Correcto!" : "¡Casi!"}</h4>
            <p className="text-sm">{answerStatus === 'correct' ? "¡Esa es! Nunca olvidaré ese momento." : "No te preocupes, ¡lo importante es el amor!"}</p>
          </div>
          <Button onClick={handleNext} className="h-10 text-base font-bold shrink-0">
            Siguiente <span className="material-symbols-outlined ml-2 text-base">arrow_forward</span>
          </Button>
        </div>
      )}

      {answerStatus === 'unanswered' && (
        <Button onClick={handleNext} className="w-full max-w-sm h-12 text-lg font-bold">
          Siguiente
        </Button>
      )}

      <RomanticLetterModal
        isOpen={!!letterToShow}
        letter={letterToShow}
        onClose={() => setLetterToShow(null)}
      />
    </div>
  );
}
