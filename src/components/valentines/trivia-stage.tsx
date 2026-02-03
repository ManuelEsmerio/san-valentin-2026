"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Lightbulb, Link, RotateCcw, XCircle } from "lucide-react";
import RomanticLetterModal from "./RomanticLetterModal";
import { PlaceHolderImages, type ImagePlaceholder } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import FifteenPuzzleModal from "./FifteenPuzzleModal";
import CircularProgress from "./CircularProgress";

type TriviaStageProps = {
  onSuccess: () => void;
};

type MultipleChoiceQuestion = {
  id: number;
  type: "multiple-choice";
  question: string;
  options: string[];
  correctAnswer: string | string[];
  image: string;
  hint: string;
  category?: string;
};

type OpenEndedQuestion = {
    id: number;
    type: 'open-ended';
    question: string;
    creatorAnswer: string;
    image: string;
    hint: string;
};

type TriviaQuestion = MultipleChoiceQuestion | OpenEndedQuestion;
type AnswerStatus = "unanswered" | "correct" | "incorrect";

const multipleChoiceQuestions: MultipleChoiceQuestion[] = [
  {
    id: 1,
    type: 'multiple-choice',
    question: '¿Quién es más competitivo en juegos de mesa?',
    options: ['Yo', 'Tú', 'Los dos', 'Ninguno'],
    correctAnswer: 'Yo',
    image: 'trivia-1',
    hint: 'Siempre hay alguien que no quiere perder 🎲',
  },
  {
    id: 2,
    type: 'multiple-choice',
    question: '¿Quién se roba más seguido la cobija?',
    options: ['Yo', 'Tú', 'Ambos', 'Nadie'],
    correctAnswer: 'Tú',
    image: 'trivia-2',
    hint: 'La lucha nocturna por sobrevivir al frío 🛏️',
  },
  {
    id: 3,
    type: 'multiple-choice',
    question: '¿Quién canta peor?',
    options: ['Yo', 'Tú', 'Ambos desafinamos', 'Nadie, somos estrellas'],
    correctAnswer: 'Ambos desafinamos',
    image: 'trivia-3',
    hint: 'El karaoke nunca miente 🎤',
  },
  {
    id: 4,
    type: 'multiple-choice',
    question: '¿Quién cocina mejor?',
    options: ['Yo', 'Tú', 'Ambos', 'Nadie, pedimos comida'],
    correctAnswer: 'Ambos',
    image: 'trivia-4',
    hint: 'El sazón nunca falla 🍳',
  },
  {
    id: 5,
    type: 'multiple-choice',
    question: '¿Qué es lo que más nos gusta hacer juntos?',
    options: ['Ver películas', 'Salir a comer', 'Viajar', 'Todo lo anterior'],
    correctAnswer: 'Todo lo anterior',
    image: 'trivia-5',
    hint: 'La mejor compañía para cualquier plan 🍿',
  },
  {
    id: 6,
    type: 'multiple-choice',
    question: '¿Quién nunca lava el baño?',
    options: ['Yo', 'Tú', 'Ambos lo evitamos', 'Siempre lo hace otro'],
    correctAnswer: 'Tú',
    image: 'trivia-6',
    hint: 'La misión imposible del aseo 🚽',
  },
  {
    id: 7,
    type: 'multiple-choice',
    question: '¿Quién ronca más fuerte?',
    options: ['Yo', 'Tú', 'Ambos', 'Nadie'],
    correctAnswer: 'Tú',
    image: 'trivia-7',
    hint: 'El concierto nocturno 🎶😴',
  },
  {
    id: 8,
    type: 'multiple-choice',
    question: '¿Quién es más distraído?',
    options: ['Yo', 'Tú', 'Ambos', 'Nadie'],
    correctAnswer: 'Yo',
    image: 'trivia-8',
    hint: 'El clásico: ‘¿y mis llaves?’ 🔑',
  },
  {
    id: 9,
    type: 'multiple-choice',
    question: '¿Quién es más enojón?',
    options: ['Yo', 'Tú', 'Ambos', 'Nadie'],
    correctAnswer: 'Ambos',
    image: 'trivia-9',
    hint: 'El que hace más caras 😡',
  },
  {
    id: 10,
    type: "multiple-choice",
    question: "¿Cómo describirías nuestra relación?",
    options: [
      "Divertida",
      "Única",
      "Auténtica",
      "Todas las anteriores"
    ],
    correctAnswer: [
      "Divertida",
      "Única",
      "Auténtica",
      "Todas las anteriores"
    ],
    image: "trivia-10",
    hint: "No hay respuesta incorrecta aquí."
  },
  {
    id: 11,
    type: 'multiple-choice',
    question: '¿Quién llora de la nada al ver videos de animalitos?',
    options: ['Yo', 'Tú', 'Ambos', 'Nadie'],
    correctAnswer: 'Tú',
    image: 'trivia-11',
    hint: 'Los animalitos siempre ganan 🐶🐱',
  },
  {
    id: 12,
    type: 'multiple-choice',
    question: '¿Quién tiene una obsesión con las chichis del otro?',
    options: ['Yo', 'Tú', 'Ambos', 'Nadie'],
    correctAnswer: 'Ambos',
    image: 'trivia-12',
    hint: 'Una obsesión divertida 🤭',
  },
  {
    id: 13,
    type: "multiple-choice",
    question: "¿Qué es lo que más valoro de nuestra relación?",
    options: [
      "La confianza",
      "La comunicación",
      "Las acciones",
      "Todo lo anterior"
    ],
    correctAnswer: "Todo lo anterior",
    image: "trivia-13",
    hint: "Es la base de todo."
  },
  {
    id: 14,
    type: "multiple-choice",
    question: "¿Cómo describirías nuestra relación?",
    options: [
      "Divertida",
      "Única",
      "Auténtica",
      "Todas las anteriores"
    ],
    correctAnswer: [
      "Divertida",
      "Única",
      "Auténtica",
      "Todas las anteriores"
    ],
    image: "trivia-14",
    hint: "No hay respuesta incorrecta aquí."
  },
  {
    id: 16,
    type: "multiple-choice",
    question: "¿A quién le huelen más las patas?",
    options: [
      "Tú",
      "Tú, también",
      "Definitivamente tú",
      "No hay duda: tú"
    ],
    correctAnswer: [
      "Tú",
      "Tú, también",
      "Definitivamente tú",
      "No hay duda: tú"
    ],
    image: "trivia-16",
    hint: "Ni el aromatizante pudo contra eso 😂🦶"
  },
  {
    id: 17,
    type: "multiple-choice",
    question: "¿Quién dura más tiempo en el baño?",
    options: [
      "Tú",
      "Tú (con el celular)",
      "Tú, pero dices que ya sales",
      "Todas las anteriores"
    ],
    correctAnswer: "Todas las anteriores",
    image: "trivia-17",
    hint: "Según tú: ‘ya casi’ 🚿📱"
  },
  {
    id: 18,
    type: "multiple-choice",
    question: "¿Quién es más pedorro?",
    options: [
      "Tú",
      "Tú, pero lo niegas",
      "Tú y luego te haces el sorprendido",
      "Todas aplican"
    ],
    correctAnswer: "Todas aplican",
    image: "trivia-18",
    hint: "El amor todo lo soporta… incluso eso 💨😂"
  },
  {
    id: 19,
    type: "multiple-choice",
    question: "¿Qué momento simple disfruto más contigo?",
    options: [
      "Platicar sin prisa",
      "Reírnos de tonterías",
      "Estar en silencio",
      "Todo lo anterior"
    ],
    correctAnswer: "Todo lo anterior",
    image: "trivia-19",
    hint: "Lo simple también es especial."
  },
  {
    id: 21,
    type: "multiple-choice",
    question: "¿Qué significa para mí compartir este juego contigo?",
    options: [
      "Un recuerdo",
      "Un detalle",
      "Un momento",
      "Un poco de todo"
    ],
    correctAnswer: "Un poco de todo",
    image: "trivia-21",
    hint: "Nada aquí es casual."
  },
  {
    id: 22,
    type: "multiple-choice",
    question: "¿A quién le da más hueva bañarse?",
    options: [
      "Tú",
      "Tú (pero dices que ahorita)",
      "Tú, pero mañana seguro sí",
      "Todas las anteriores 👀"
    ],
    correctAnswer: "Todas las anteriores 👀",
    image: "trivia-22",
    hint: "El agua no muerde… pero parece que sí 😂🚿"
  }
];


const openEndedQuestions: OpenEndedQuestion[] = [
    {
        id: 23,
        type: 'open-ended',
        question: '¿Qué es lo que más valoras cuando te sientes en calma conmigo?',
        creatorAnswer: 'Valoro que, aun con malentendidos, conversaciones incómodas o silencios, sigamos eligiendo quedarnos un momento más y no salir corriendo cuando algo duele.',
        image: 'open-ended-1',
        hint: 'Una pregunta sobre el presente y la paz.'
    },
    {
        id: 24,
        type: 'open-ended',
        question: '¿Qué sientes que nos ha costado más últimamente?',
        creatorAnswer: 'Siento que nos ha costado escucharnos de verdad, sin sentir que tenemos que defendernos o estar a la defensiva todo el tiempo.',
        image: 'open-ended-2',
        hint: 'Una reflexión sobre nuestra comunicación.'
    },
    {
        id: 25,
        type: 'open-ended',
        question: '¿Qué necesitarías hoy para sentirte tranquila, sin presión?',
        creatorAnswer: 'Estar presente, apoyar en lo que esté en mis manos y respetar tu ritmo, sin exigencias ni promesas vacías.',
        image: 'open-ended-3',
        hint: 'Una pregunta sobre el presente y la paz.'
    }
];

const LETTERS = {
  5: {
    title: "Lo que más amo de ti…",
    content: [
      "Tu sonrisa, tu cariño y tu manera tan hermosa de querer hacen que cada día valga la pena. 💖",
      "Aunque a veces no estemos de acuerdo y peleemos, yo te elijo a ti.",
      "Gracias por tu paciencia, por entenderme cuando me cuesta explicarme, por quedarte incluso cuando no es fácil y por elegirnos una y otra vez.",
      "A tu lado aprendí que el amor también es calma, apoyo y complicidad, y que también son pláticas incómodas, discusiones y peleas, pero siempre volver a escogernos.",
    ],
    imageIds: ["letter-1-img-1", "letter-1-img-2", "letter-1-img-3"],
  },
  10: {
    title: "Mi recuerdo más preciado…",
    content: [
      "Tal vez no fue perfecto, pero fue real.",
      "Los días que me quedé en Lagos solo con tal de verte, cuando todavía no conocía nada, pero sí tenía claro que quería conocerte a ti.",
      "Tanto, que dormí en el suelo en casa de Edgar, hicimos carne asada y fueron días muy bonitos que siempre voy a apreciar profundamente.",
      "Desde ese momento supe que algo especial estaba empezando entre nosotros. ✨",
    ],
    imageIds: ["letter-2-img-1", "letter-2-img-2", "letter-2-img-3"],
  },
  15: {
    title: "Lo que quiero contigo…",
    content: [
      "Compartir risas, crear más recuerdos y seguir eligiéndonos todos los días,",
      "en los días malos, cuando estemos cansados y sintamos que no podemos más, saber que estamos el uno para el otro, para apoyarnos y darnos la mano en esos momentos, sin importar lo que venga. 💕",
    ],
    imageIds: ["letter-3-img-1", "letter-3-img-2", "letter-3-img-3"],
  },
  20: {
    title: "Lo que nos unió a pesar de la distancia…",
    content: [
      "Al principio, todo era pantalla y voz. Pero cada videollamada nos acercaba más, como si el tiempo y la distancia se hicieran pequeños cuando te veía sonreír.",
      "Hablábamos de todo y de nada, y aun así cada conversación me hacía sentir más cerca de ti.",
      "A veces me quedaba despierto solo para verte un ratito más, aunque fuera cansado, aunque fuera tarde… porque tú valías la pena.",
      "Esas llamadas fueron el inicio de algo que hoy es mucho más grande: nosotros. 💞",
    ],
    imageIds: ["letter-4-img-1", "letter-4-img-2", "letter-4-img-3"],
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
  const [stage, setStage] = useState<"intro" | "playing" | "failed" | "finished">("intro");
  const { toast } = useToast();
  
  const [letterToShow, setLetterToShow] = useState<{ title: string; content: string[]; images: ImagePlaceholder[] } | null>(null);
  const [shownLetters, setShownLetters] = useState<Record<number, boolean>>({});
  const [isPuzzleModalOpen, setPuzzleModalOpen] = useState(false);
  const [flippedQuestions, setFlippedQuestions] = useState<Record<number, boolean>>({});


  const setupTrivia = () => {
    const sortedMcq = [...multipleChoiceQuestions].sort((a,b) => a.id - b.id);
    const shuffledMcq = shuffleArray(sortedMcq);
    const allQuestions = [...shuffledMcq, ...openEndedQuestions];
    setQuestions(allQuestions);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setAnswerStatus('unanswered');
    setStage("intro");
    setShownLetters({});
    setPuzzleModalOpen(false);
    setFlippedQuestions({});
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
  const imagePlaceholder = PlaceHolderImages.find(img => img.id === currentQuestion?.image);


  const handleAnswerChange = (value: string) => {
    if (answerStatus !== 'unanswered') return;
     if (currentQuestion.type === 'open-ended' && flippedQuestions[currentQuestion.id]) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };
  
  const goToNextQuestion = () => {
    setAnswerStatus("unanswered");
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      if (score >= MIN_CORRECT_ANSWERS) {
        setStage("finished");
      } else {
        setStage("failed");
      }
    }
  };

  const handleNext = () => {
    if (answerStatus !== 'unanswered') {
      goToNextQuestion();
      return;
    }

    if (currentQuestion.type === 'open-ended') {
      if (flippedQuestions[currentQuestion.id]) {
        goToNextQuestion();
      } else {
        const currentAnswer = answers[currentQuestion.id];
        if (!currentAnswer || currentAnswer.trim() === '') {
            toast({ title: "Un momento...", description: "Por favor, comparte tus pensamientos antes de continuar." });
            return;
        }
        setFlippedQuestions(prev => ({ ...prev, [currentQuestion.id]: true }));
      }
      return;
    }
    
    const currentAnswer = answers[currentQuestion.id];
    if (!currentAnswer) {
        toast({ title: "Espera un poquito", description: "Debes seleccionar una respuesta." });
        return;
    }
    
    const correctAnswer = (currentQuestion as MultipleChoiceQuestion).correctAnswer;
    let isCorrect = false;

    if (Array.isArray(correctAnswer)) {
      isCorrect = correctAnswer.includes(currentAnswer);
    } else {
      isCorrect = currentAnswer === correctAnswer;
    }
    
    if (isCorrect) {
        setScore(prev => prev + 1);
        setAnswerStatus('correct');
    } else {
        setAnswerStatus('incorrect');
    }
  };


  const handleRetry = () => {
    setupTrivia();
  };

  if (stage === "intro") {
    return (
      <div className="w-full bg-card rounded-xl shadow-xl overflow-hidden border border-primary/5 animate-fade-in">
        <div className="p-6 sm:p-10 text-center flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-primary text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                quiz
            </span>
            <h2 className="text-foreground text-3xl font-bold leading-tight tracking-[-0.015em]">
                ¡Bien hecho, mi chula!
            </h2>
            <p className="text-muted-foreground max-w-md">
                Superaste el primer desafío y conseguiste la pista. Ahora, una trivia para demostrar cuánto nos conocemos. ¿Estás lista?
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                <Button
                    onClick={() => setStage('playing')}
                    className="h-12 px-8 text-lg font-bold shadow-lg shadow-primary/20"
                    size="lg"
                >
                    ¡Estoy lista!
                </Button>
            </div>
        </div>
      </div>
    );
  }
  
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
        <>
          <div className="w-full bg-card rounded-xl shadow-xl overflow-hidden border border-primary/5">
              <div className="px-4 sm:px-8 pb-10 pt-6">
                  <Alert className="animate-fade-in text-center border-green-500/50">
                      <span className="material-symbols-outlined text-primary text-5xl">check_circle</span>
                      <AlertTitle className="font-headline mt-2 text-xl text-green-600">¡Perfecto! ¡Sabía que lo sabrías todo!</AlertTitle>
                      <AlertDescription className="font-body space-y-4 mt-4 text-foreground/80">
                        <p>Has completado el desafío. Ahora, un último juego te separa de la sorpresa final.</p>
                        <Button onClick={() => setPuzzleModalOpen(true)} className="w-full h-12 text-lg font-bold">Continuar</Button>
                      </AlertDescription>
                  </Alert>
              </div>
          </div>
          <FifteenPuzzleModal 
            isOpen={isPuzzleModalOpen}
            onSuccess={onSuccess}
          />
        </>
      )
  }

  if (!currentQuestion || stage !== 'playing' || !questions.length) {
    return null;
  }

  return (
    <>
      <div className="w-full flex flex-col items-center gap-6">
        {imagePlaceholder ? (
          // Layout WITH image
          <div className="w-full flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="w-full md:flex-1">
              <div className="w-full bg-card rounded-xl shadow-xl overflow-hidden border border-primary/5">
                <div className="relative w-full aspect-video rounded-t-xl overflow-hidden bg-black/20">
                  <Image
                    src={imagePlaceholder.imageUrl}
                    alt={imagePlaceholder.description}
                    data-ai-hint={imagePlaceholder.imageHint}
                    fill
                    className="object-contain"
                    priority
                  />
                  {currentQuestion.type === "multiple-choice" && currentQuestion.category && (
                    <div className="absolute bottom-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                      {currentQuestion.category}
                    </div>
                  )}
                </div>
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
                      {(currentQuestion as MultipleChoiceQuestion).options.map((option, index) => (
                        <Label 
                          key={`${option}-${index}`}
                          htmlFor={`${option}-${index}`}
                          className={cn(
                            "flex items-center space-x-3 p-4 rounded-lg border-2 border-border has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 cursor-pointer transition-all",
                            answerStatus !== 'unanswered' &&
                              (Array.isArray((currentQuestion as MultipleChoiceQuestion).correctAnswer)
                                ? (currentQuestion as MultipleChoiceQuestion).correctAnswer.includes(option)
                                : (currentQuestion as MultipleChoiceQuestion).correctAnswer === option) &&
                              "border-green-500 bg-green-500/5",
                            answerStatus === 'incorrect' && answers[currentQuestion.id] === option && "border-destructive bg-destructive/5"
                          )}
                        >
                          <RadioGroupItem value={option} id={`${option}-${index}`} disabled={answerStatus !== 'unanswered'} />
                          <span className="font-body text-base flex-1">{option}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  )}
                  {currentQuestion.type === 'open-ended' && (
                    <div className="pt-2 [perspective:1000px]">
                      <div
                          className={cn(
                              "relative w-full min-h-[160px] [transform-style:preserve-3d] transition-transform duration-1000",
                              flippedQuestions[currentQuestion.id] && "[transform:rotateY(180deg)]"
                          )}
                      >
                          <div className="absolute w-full h-full [backface-visibility:hidden]">
                              <Textarea
                              placeholder="Escribe tu respuesta aquí, mi chula..."
                              className="min-h-[160px] text-base"
                              value={answers[currentQuestion.id] || ""}
                              onChange={(e) => handleAnswerChange(e.target.value)}
                              disabled={!!flippedQuestions[currentQuestion.id]}
                              />
                          </div>

                          <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-primary/10 p-6 rounded-lg flex flex-col justify-center items-center text-center">
                              <p className="text-foreground/80 italic text-lg">
                                  &ldquo;{(currentQuestion as OpenEndedQuestion).creatorAnswer}&rdquo;
                              </p>
                          </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Progress Circle Side */}
            <div className="w-full md:w-auto flex justify-center md:pl-8">
                <CircularProgress current={currentQuestionIndex + 1} total={questions.length} />
            </div>
          </div>
        ) : (
          // Layout WITHOUT image
          <div className="w-full bg-card rounded-xl shadow-xl overflow-hidden border border-primary/5">
            <div className="flex flex-col-reverse md:flex-row items-center p-6 md:p-8 gap-8">
              {/* Question Side */}
              <div className="w-full flex-1">
                <h2 className="text-2xl font-bold mb-2">{currentQuestion.question}</h2>
                <p className="text-muted-foreground mb-6">{currentQuestion.hint}</p>

                {currentQuestion.type === 'multiple-choice' && (
                  <RadioGroup
                    onValueChange={handleAnswerChange}
                    value={answers[currentQuestion.id] || ""}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    disabled={answerStatus !== 'unanswered'}
                  >
                    {(currentQuestion as MultipleChoiceQuestion).options.map((option, index) => (
                      <Label 
                        key={`${option}-${index}`}
                        htmlFor={`${option}-${index}`}
                        className={cn(
                          "flex items-center space-x-3 p-4 rounded-lg border-2 border-border has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 cursor-pointer transition-all",
                          answerStatus !== 'unanswered' &&
                            (Array.isArray((currentQuestion as MultipleChoiceQuestion).correctAnswer)
                              ? (currentQuestion as MultipleChoiceQuestion).correctAnswer.includes(option)
                              : (currentQuestion as MultipleChoiceQuestion).correctAnswer === option) &&
                            "border-green-500 bg-green-500/5",
                          answerStatus === 'incorrect' && answers[currentQuestion.id] === option && "border-destructive bg-destructive/5"
                        )}
                      >
                        <RadioGroupItem value={option} id={`${option}-${index}`} disabled={answerStatus !== 'unanswered'} />
                        <span className="font-body text-base flex-1">{option}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                )}

                {currentQuestion.type === 'open-ended' && (
                  <div className="pt-2 [perspective:1000px]">
                      <div
                          className={cn(
                              "relative w-full min-h-[160px] [transform-style:preserve-3d] transition-transform duration-1000",
                              flippedQuestions[currentQuestion.id] && "[transform:rotateY(180deg)]"
                          )}
                      >
                          <div className="absolute w-full h-full [backface-visibility:hidden]">
                              <Textarea
                              placeholder="Escribe tu respuesta aquí, mi chula..."
                              className="min-h-[160px] text-base"
                              value={answers[currentQuestion.id] || ""}
                              onChange={(e) => handleAnswerChange(e.target.value)}
                              disabled={!!flippedQuestions[currentQuestion.id]}
                              />
                          </div>

                          <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-primary/10 p-6 rounded-lg flex flex-col justify-center items-center text-center">
                              <p className="text-foreground/80 italic text-lg">
                                  &ldquo;{(currentQuestion as OpenEndedQuestion).creatorAnswer}&rdquo;
                              </p>
                          </div>
                      </div>
                  </div>
                )}
              </div>
              
              {/* Progress Circle Side */}
              <div className="w-full md:w-auto md:pl-8 md:border-l border-border flex justify-center">
                <CircularProgress current={currentQuestionIndex + 1} total={questions.length} />
              </div>
            </div>
          </div>
        )}

        {answerStatus !== 'unanswered' ? (
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
        ) : (
          <Button 
              onClick={handleNext} 
              className="w-full max-w-sm h-12 text-lg font-bold"
              disabled={currentQuestion.type === 'open-ended' && !answers[currentQuestion.id] && !flippedQuestions[currentQuestion.id]}
          >
            {currentQuestion.type === 'open-ended' 
              ? (flippedQuestions[currentQuestion.id] ? 'Continuar' : 'Revelar mi respuesta')
              : 'Siguiente'
            }
          </Button>
        )}
      </div>
      
      <RomanticLetterModal
        isOpen={!!letterToShow}
        letter={letterToShow}
        onClose={() => setLetterToShow(null)}
      />

      <FifteenPuzzleModal 
        isOpen={isPuzzleModalOpen}
        onSuccess={onSuccess}
      />
    </>
  );
}
