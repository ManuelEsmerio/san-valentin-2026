
"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, RotateCcw, XCircle, Info, Gamepad2, Lock, LockOpen } from "lucide-react";
import RomanticLetterModal from "./RomanticLetterModal";
import {
  PlaceHolderImages,
  type ImagePlaceholder,
} from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import CircularProgress from "./CircularProgress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MapModal from "./MapModal";
import KeywordModal from "./KeywordModal";
import { saveOpenEndedAnswer } from "@/app/actions";

type GameStage = "intro" | "playing" | "failed" | "finished";

type TriviaStageProps = {
  onGameWon: () => void;
  onAdvance: () => void;
  user: string | null;
  initialGameState?: GameStage;
};

type MultipleChoiceQuestion = {
  id: number;
  type: "multiple-choice";
  question: string;
  options: string[];
  correctAnswer: string | string[];
  hint: string;
  category?: string;
};

type OpenEndedQuestion = {
  id: number;
  type: "open-ended";
  question: string;
  creatorAnswer: string;
  hint: string;
};

type TriviaQuestion = MultipleChoiceQuestion | OpenEndedQuestion;
type AnswerStatus = "unanswered" | "correct" | "incorrect";

// Data moved outside component to prevent redeclaration
const multipleChoiceQuestions: MultipleChoiceQuestion[] = [
  { id: 1, type: 'multiple-choice', question: '¿Quién es más competitivo en juegos de mesa?', options: ['Yo','Tú','Los dos','Ninguno'], correctAnswer: 'Yo', hint: 'Siempre hay alguien que no quiere perder 🎲' },

  { id: 2, type: 'multiple-choice', question: '¿Quién se roba más seguido la cobija?', options: ['Yo','Tú','Ambos','Nadie'], correctAnswer: 'Tú', hint: 'La lucha nocturna por sobrevivir al frío 🛏️' },

  { id: 3, type: 'multiple-choice', question: '¿Quién canta peor?', options: ['Yo','Tú','Ambos desafinamos','Nadie, somos estrellas'], correctAnswer: ['Yo','Ambos desafinamos'], hint: 'El karaoke nunca miente 🎤' },

  { id: 4, type: 'multiple-choice', question: '¿Quién cocina mejor?', options: ['Yo','Tú','Ambos','Nadie, pedimos comida'], correctAnswer: 'Ambos', hint: 'El sazón nunca falla 🍳' },

  // 5 se omite

  { id: 6, type: 'multiple-choice', question: '¿Quién ronca más fuerte?', options: ['Yo','Tú','Ambos','Nadie'], correctAnswer: 'Tú', hint: 'El concierto nocturno 🎶😴' },

  { id: 7, type: 'multiple-choice', question: '¿Quién es más distraído?', options: ['Yo','Tú','Ambos','Nadie'], correctAnswer: 'Yo', hint: 'El clásico: ‘¿y mis llaves?’ 🔑' },

  { id: 8, type: 'multiple-choice', question: '¿Quién llora al ver videos de animalitos?', options: ['Yo','Tú','Ambos','Nadie'], correctAnswer: 'Tú', hint: 'Los animalitos siempre ganan 🐶🐱' },

  { id: 9, type: 'multiple-choice', question: '¿Qué es lo que más valoro de nuestra relación?', options: ['La confianza','La comunicación','Las acciones','Todo lo anterior'], correctAnswer: 'Todo lo anterior', hint: 'Es la base de todo 💙' },

  // 10 se omite

  { id: 11, type: 'multiple-choice', question: '¿Cómo describirías nuestra relación?', options: ['Divertida','Única','Auténtica','Todas las anteriores'], correctAnswer: ['Divertida','Única','Auténtica','Todas las anteriores'], hint: 'No hay respuesta incorrecta aquí ✨' },

  { id: 12, type: 'multiple-choice', question: '¿Qué momento simple disfruto más contigo?', options: ['Platicar sin prisa','Reírnos de tonterías','Estar en silencio','Todo lo anterior'], correctAnswer: 'Todo lo anterior', hint: 'Lo simple también es especial 💫' },

  { id: 13, type: 'multiple-choice', question: '¿Qué significa para mí compartir este juego contigo?', options: ['Un recuerdo','Un detalle','Un momento','Un poco de todo'], correctAnswer: ['Un recuerdo','Un detalle','Un momento','Un poco de todo'], hint: 'Nada aquí es casual 💝' },

  { id: 14, type: 'multiple-choice', question: '¿Qué es lo que más nos gusta hacer juntos?', options: ['Ver películas','Salir a comer','Viajar','Todo lo anterior'], correctAnswer: ['Ver películas','Salir a comer','Viajar','Todo lo anterior'], hint: 'La mejor compañía para cualquier plan 🍿' },

  // 15 se omite

  { id: 16, type: 'multiple-choice', question: '¿Quién es más probable que se pierda usando un mapa?', options: ['Yo','Tú','Ambos','El GPS nos odia'], correctAnswer: 'Yo', hint: 'A veces la orientación falla 🗺️😂' },

  { id: 17, type: 'multiple-choice', question: '¿Quién elige siempre la película?', options: ['Lo decidimos juntos','Tú','Yo','Netflix decide'], correctAnswer: 'Lo decidimos juntos', hint: 'El control remoto manda 📺' },

  { id: 18, type: 'multiple-choice', question: '¿Quién se come los postres del otro?', options: ['Yo','Tú','Ambos','Nunca pasa'], correctAnswer: 'Yo', hint: 'El misterio del postre 🍰' },

  { id: 19, type: 'multiple-choice', question: '¿Quién es más ahorrador?', options: ['Yo','Tú','Depende','Ambos'], correctAnswer: 'Yo', hint: 'Cuidando los centavos 💰' },

  // 20 se omite

  { id: 21, type: 'multiple-choice', question: '¿Quién tarda más en decidir qué vamos a comer?', options: ['Yo','Tú','Ambos','Pedimos lo mismo'], correctAnswer: 'Ambos', hint: 'Elegir comida es un reto 🍕😂' },

  { id: 22, type: 'multiple-choice', question: '¿Quién da los mejores abrazos?', options: ['Yo','Tú','Ambos','Imposible decidir'], correctAnswer: 'Ambos', hint: 'Abrazos que curan 💙' },

  { id: 23, type: 'multiple-choice', question: '¿Quién propone más planes sorpresa?', options: ['Yo','Tú','Ambos','Ninguno'], correctAnswer: 'Ambos', hint: 'Siempre hay sorpresas 🎁' },

  { id: 24, type: 'multiple-choice', question: '¿Quién anima al otro cuando está triste?', options: ['Yo','Tú','Ambos','Siempre nos apoyamos'], correctAnswer: 'Siempre nos apoyamos', hint: 'Equipo para todo 💞' },

  { id: 25, type: 'multiple-choice', question: '¿Quién se queda dormido primero?', options: ['Yo','Tú','Ambos','Depende del día'], correctAnswer: 'Depende del día', hint: 'Buenas noches 😴✨' }
];


const openEndedQuestions: OpenEndedQuestion[] = [
    { id: 26, type: 'open-ended', question: '¿Qué es lo que más valoras cuando te sientes en calma conmigo?', creatorAnswer: 'Valoro que, aun en los momentos complicados, sigamos eligiéndonos. Que nos quedemos, que nos escuchemos y que no huyamos cuando algo duele, porque nuestra paz nace de no rendirnos el uno con el otro. 💕', hint: 'Una pregunta sobre el presente y la paz.' },
    {
      id: 27,
      type: 'open-ended',
      question: '¿Qué sientes que nos ha costado más últimamente?',
      creatorAnswer: `Siento que hemos caído en la monotonía de hacer siempre lo mismo, y sé que a ti te afecta más que a mí. Especialmente el no tener todavía tu espacio seguro, tus cosas, estar lejos de tu familia, lidiar con un trabajo difícil, con personas complicadas… y además un novio terco al que a veces le cuesta entender muchas cosas.

Todo eso ha tenido un impacto muy fuerte en ti, y poco a poco ha ido apagando a la hermosa persona que eres. Eso me duele, porque te amo y me importa lo que sientes.

Pero también sé que, con el apoyo adecuado y con los cambios correctos, vas a volver a sentirte mejor. Y yo quiero estar a tu lado para acompañarte en ese proceso y verlo contigo. 💙`,
      hint: 'Una reflexión sobre nuestra comunicación.'
    },    
    { id: 28, type: 'open-ended', question: '¿Qué te ayuda hoy a sentirte más tranquila cuando estamos juntos?', creatorAnswer: 'Que estés presente de verdad, que me apoyes en lo que puedas y que respetes mi ritmo. Sin exigencias, sin promesas vacías, solo estando conmigo.', hint: 'Una pregunta sobre el presente y la paz.' }
];

const LETTERS: Record<number, { title: string; content: string[]; imageIds: string[] }> = {
  5: {
    title: '¿Recuerdas ese día especial?',
    content: [
      'Fue cuando fuimos a nuestro primer concierto. Tenías la sonrisa más grande y hermosa que haya visto. No cabías de la emoción por ver a Coldplay, tanto que cantaste a todo pulmón ese día, sin importar lo mal que cantas 😂 (ntc).',
      'Es un momento muy especial para mí y lo recuerdo siempre con una sonrisa.',
      'Ese día también tuvimos nuestros problemas para llegar puntuales al estadio. Andábamos desesperados buscando Uber o camión, y se te notaba lo estresada que estabas porque pensabas que no ibas a ver a Coldplay.',
      'Pero, de una manera u otra, solucionamos todo y disfrutamos el concierto.',
      'Y así como ese día, juntos podemos con todo. ❤️'
    ],
    imageIds: ['letter-1-img-1', 'letter-1-img-2', 'letter-1-img-3']
  },
  10: {
    title: 'Mi recuerdo más preciado…',
    content: [
      'Recuerdo una de mis primeras veces en Lagos, y aunque diga que iba a ver a Edgar 😂, en realidad iba a verte a ti.',
      'Me quedaba varios días solo para poder verte, aunque fuera unos minutos en persona, y cada segundo contigo valía la pena.',
      'Con ese poco tiempo que compartimos, me enamoré… y no solo de Lagos, sino de ti.',
      'Me mostraste muchas cosas, lugares y momentos, pero siempre con la mejor compañía: tú.',
      'Desde entonces supe que contigo todo se sentía especial y diferente. ✨'
    ],
    imageIds: ['letter-2-img-1', 'letter-2-img-2', 'letter-2-img-3']
  },
  15: {
    title: 'Lo que quiero contigo…',
    content: [
      'Es algo que me fascina de ti, y sé que ahorita estás pasando por un mal momento. Comprendo que no es fácil ver ese lado tan bonito de ti en estos días.',
      'Pero aun así, yo sigo aquí, creyendo en nosotros y en todo lo que podemos construir juntos.',
      'Quiero acompañarte en tus procesos, apoyarte cuando te sientas cansada y recordarte lo valiosa que eres, incluso cuando tú no lo veas.',
      'Quiero seguir eligiéndote todos los días, en los buenos y en los malos, sin rendirme a la primera dificultad.',
      'Porque contigo no solo quiero momentos felices, quiero una historia real, sincera y duradera. 💕'
    ],
    imageIds: ['letter-3-img-1', 'letter-3-img-2', 'letter-3-img-3']
  },
  20: {
    title: 'Lo que nos unió a pesar de la distancia…',
    content: [
      'Así empezó todo: días, semanas y meses hablando por videollamadas de todo tipo de cosas, desde lo más simple hasta lo más profundo.',
      'La distancia fue un factor muy importante, pero nunca fue un obstáculo para nosotros. Ni eso logró detener lo que sentíamos.',
      'Fueron noches en vela, horas en llamadas, miles de pláticas que nos acercaron cada vez más.',
      'Siempre con tu sonrisa tan hermosa, esa que jamás había visto en nadie más, y que hacía que todo valiera la pena.',
      'Desde entonces supe que lo nuestro no dependía de kilómetros, sino de ganas, amor y conexión. 💞'
    ],
    imageIds: ['letter-4-img-1', 'letter-4-img-2', 'letter-4-img-3']
  },
};

const MIN_CORRECT_ANSWERS = 0;

const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const IntroScreen = memo(({ onStart, onSkip, user }: { onStart: () => void; onSkip: () => void; user: string | null; }) => (
  <div className="w-full bg-card rounded-xl shadow-xl overflow-hidden border border-primary/5 animate-fade-in">
    <div className="p-6 sm:p-10 text-center flex flex-col items-center gap-4">
      <span className="material-symbols-rounded text-primary text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
      <h2 className="text-foreground text-3xl font-bold leading-tight tracking-[-0.015em]">¡Vas muy bien! Has superado los dos primeros desafíos.</h2>
      <p className="text-muted-foreground max-w-md">
        Ahora, una trivia para ver qué tanto nos conocemos. ¿Lista?
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
        <Button onClick={onStart} className="w-full sm:w-auto h-12 px-8 text-lg font-bold shadow-lg shadow-primary/20" size="lg">Empezar Desafío</Button>
        {user === 'manuel' && (
            <Button onClick={onSkip} variant="outline" className="w-full sm:w-auto h-12">
                Saltar Desafío (Dev)
            </Button>
        )}
      </div>
    </div>
  </div>
));
IntroScreen.displayName = 'IntroScreen';

const InstructionsModal = memo(({ isOpen, onOpenChange, onStartGame }: { isOpen: boolean; onOpenChange: (open: boolean) => void; onStartGame: () => void; }) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="text-2xl text-center font-bold">Instrucciones del Desafío</DialogTitle>
                <DialogDescription asChild>
                    <div className="text-center pt-4 space-y-4 text-base text-muted-foreground">
                        <p>A continuación, se te presentarán una serie de preguntas sobre nosotros. Algunas son de opción múltiple y otras son para que escribas tu sentir.</p>
                        <p className="font-bold text-primary italic">Recuerda que estas preguntas deben ser respondidas con la verdad.</p>
                        <p>Alcanza la puntuación mínima para desbloquear el siguiente desafío. ¡Mucha suerte!</p>
                    </div>
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4">
                <Button onClick={onStartGame} className="w-full h-12 text-lg font-bold">¡A jugar!</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
));
InstructionsModal.displayName = 'InstructionsModal';

const FailedScreen = memo(({ score, onRetry }: { score: number, onRetry: () => void }) => (
    <div className="w-full bg-card rounded-xl shadow-xl overflow-hidden border border-primary/5">
        <div className="px-4 sm:px-8 pb-10 pt-6 text-center">
            <Alert className="animate-fade-in text-center border-destructive/50 text-destructive">
                <span className="material-symbols-rounded text-5xl">sentiment_dissatisfied</span>
                <AlertTitle className="font-headline mt-2 text-xl">¡Oh no! No pasaste la prueba.</AlertTitle>
                <AlertDescription className="font-body space-y-4 mt-4 text-foreground/80">
                    <p>Obtuviste {score} de {multipleChoiceQuestions.length}. Pero no te preocupes, el amor es también dar segundas oportunidades. ¡Inténtalo de nuevo!</p>
                    <Button onClick={onRetry} className="w-full h-12 text-lg font-bold"><RotateCcw className="mr-2 h-4 w-4" /> Reintentar</Button>
                </AlertDescription>
            </Alert>
        </div>
    </div>
));
FailedScreen.displayName = 'FailedScreen';

const FinishedContent = ({ onShowHint }: { onShowHint: () => void }) => (
  <div className="flex flex-col items-center gap-4 text-center p-8 animate-fade-in">
    <div className="relative bg-background w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border border-green-500/20">
      <span className="material-symbols-rounded text-green-500 text-5xl">check_circle</span>
    </div>
    <h2 className="text-green-600 dark:text-green-400 text-3xl font-bold">¡Desafío completado!</h2>
    <p className="text-muted-foreground max-w-md">
      ¡Perfecto! Sabía que lo sabrías todo. Estás un paso más cerca de la sorpresa final.
    </p>
    <Button onClick={onShowHint} className="mt-4 w-full max-w-xs h-12 text-lg font-bold">
      Ver Siguiente Pista
    </Button>
  </div>
);


export default function TriviaStage({ onGameWon, onAdvance, user, initialGameState = 'intro' }: TriviaStageProps) {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>("unanswered");
  const [stage, setStage] = useState<GameStage>(initialGameState);
  const { toast } = useToast();

  const [letterToShow, setLetterToShow] = useState<{ title: string; content: string[]; images: ImagePlaceholder[] } | null>(null);
  const [shownLetters, setShownLetters] = useState<Record<number, boolean>>({});
  const [flippedQuestions, setFlippedQuestions] = useState<Record<number, boolean>>({});
  const [isInstructionsModalOpen, setInstructionsModalOpen] = useState(false);
  const [isMapModalOpen, setMapModalOpen] = useState(false);
  const [isKeywordModalOpen, setKeywordModalOpen] = useState(false);

  const scoreRef = useRef(score);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  
  const setupTrivia = useCallback(() => {
    const shuffledMcq = shuffleArray([...multipleChoiceQuestions]);
    const allQuestions = [...shuffledMcq, ...openEndedQuestions];
    setQuestions(allQuestions);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setAnswerStatus("unanswered");
    setStage(initialGameState);
    setShownLetters({});
    setFlippedQuestions({});
  }, [initialGameState]);

  useEffect(() => {
    setupTrivia();
  }, [setupTrivia]);

  const showLetter = useCallback((letterKey: keyof typeof LETTERS) => {
      if (LETTERS[letterKey] && !shownLetters[letterKey]) {
        const letterData = LETTERS[letterKey];
        const letterImages = letterData.imageIds.map(id => PlaceHolderImages.find(img => img.id === id)).filter((img): img is ImagePlaceholder => !!img);
        setLetterToShow({ ...letterData, images: letterImages });
        setShownLetters(prev => ({ ...prev, [letterKey]: true }));
        return true;
      }
      return false;
    }, [shownLetters]);

  const goToNextQuestion = useCallback(() => {
    setAnswerStatus("unanswered");
    const isLastQuestion = currentQuestionIndex >= questions.length - 1;

    if (isLastQuestion) {
      if (scoreRef.current >= MIN_CORRECT_ANSWERS) {
        setStage("finished");
      } else {
        setStage("failed");
      }
    } else {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  }, [currentQuestionIndex, questions.length]);
  
  useEffect(() => {
    if (stage === 'finished' && initialGameState !== 'finished') {
      onGameWon();
    }
  }, [stage, initialGameState, onGameWon]);

  const handleAnswerSelected = useCallback((value: string) => {
    if (answerStatus !== 'unanswered') return;

    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.type !== 'multiple-choice') return;
    
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));

    const correctAnswer = currentQuestion.correctAnswer;
    const isCorrect = Array.isArray(correctAnswer) ? correctAnswer.includes(value) : value === correctAnswer;
    
    if (isCorrect) {
        setScore(s => s + 1);
        setAnswerStatus('correct');
    } else {
        setAnswerStatus('incorrect');
    }
  }, [answerStatus, currentQuestionIndex, questions]);
  
  useEffect(() => {
    if (answerStatus === 'unanswered') return;

    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion?.type !== 'multiple-choice') return;

    let wasLetterShown = false;
    if (answerStatus === 'correct') {
        const newScore = score;
        const letterKey = newScore as keyof typeof LETTERS;
        const isLastMCQ = questions[currentQuestionIndex + 1]?.type === "open-ended";

        if (LETTERS[letterKey] && !shownLetters[letterKey]) {
            wasLetterShown = showLetter(letterKey);
        } else if (isLastMCQ && !shownLetters[20]) {
            wasLetterShown = showLetter(20);
        }
    }

    if (!wasLetterShown) {
        const timer = setTimeout(goToNextQuestion, 1200);
        return () => clearTimeout(timer);
    }
  }, [answerStatus, currentQuestionIndex, goToNextQuestion, questions, score, showLetter, shownLetters]);


  const handleNext = useCallback(async () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || currentQuestion.type !== 'open-ended') return;

    if (flippedQuestions[currentQuestion.id]) {
      goToNextQuestion();
    } else {
      const currentAnswer = answers[currentQuestion.id];
      if (!currentAnswer || currentAnswer.trim() === '') {
          toast({ title: "Un momento...", description: "Por favor, comparte tus pensamientos antes de continuar." });
          return;
      }
      
      try {
        await saveOpenEndedAnswer({
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          answer: currentAnswer,
        });
        toast({
          title: 'Respuesta guardada',
          description: 'Gracias por compartir tus pensamientos. ❤️',
          className: 'bg-blue-100 dark:bg-blue-900/30 border-blue-500',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error al guardar',
          description: 'No se pudo guardar tu respuesta. ¡Pero la leí! 😉',
        });
      }

      setFlippedQuestions(prev => ({ ...prev, [currentQuestion.id]: true }));
    }
  }, [answers, currentQuestionIndex, flippedQuestions, goToNextQuestion, questions, toast]);


  const handleRetry = useCallback(() => {
    setupTrivia();
    setStage('playing');
  }, [setupTrivia]);

  const handleStartGame = () => {
    setInstructionsModalOpen(false);
    setStage("playing");
  };

  const handleOpenKeywordModal = useCallback(() => {
    setMapModalOpen(false);
    setKeywordModalOpen(true);
  }, []);

  const handleReturnToMap = useCallback(() => {
    setKeywordModalOpen(false);
    setMapModalOpen(true);
  }, []);

  const handleKeywordSuccess = useCallback(() => {
    setKeywordModalOpen(false);
    onAdvance();
  }, [onAdvance]);
    
  const coordinates = "20.883645° N, 103.837895° W";
  const lat = "20.883645";
  const long = "-103.837895";
  const googleMapsUrl = `https://maps.app.goo.gl/xmT7CSVamfgz6AfF7`;
  const iframeUrl = `https://maps.google.com/maps?q=${lat},${long}&hl=es&z=14&output=embed`;
  
  const currentQuestion = questions[currentQuestionIndex];
  const hintProgress = multipleChoiceQuestions.length > 0 ? (score / multipleChoiceQuestions.length) * 100 : 0;
  const isGameWon = stage === 'finished';

  const renderMainContent = () => {
    switch (stage) {
      case "intro":
        return <IntroScreen onStart={() => setInstructionsModalOpen(true)} onSkip={onGameWon} user={user} />;
      case "failed":
        return <FailedScreen score={score} onRetry={handleRetry} />;
      case "finished":
        return (
          <div className="w-full bg-card rounded-xl shadow-xl overflow-hidden border border-primary/5">
            <FinishedContent onShowHint={() => setMapModalOpen(true)} />
          </div>
        );
      case "playing":
        if (!currentQuestion) return null;
        return (
          <div className="w-full animate-fade-in">
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Trivia Content */}
              <div className="lg:col-span-8">
                <div className="relative overflow-hidden flex flex-col gap-4 rounded-2xl bg-card p-4 sm:p-6 border-2 border-primary/10 h-full">
                  <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:30px_30px]"></div>
                  
                  <div className="bg-card/50 dark:bg-zinc-800/30 border border-border p-4 rounded-xl flex-1 flex flex-col">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold">{currentQuestion.question}</h2>
                      <p className="text-muted-foreground mt-2">{currentQuestion.hint}</p>
                    </div>
                    
                    <div className="flex-1">
                      {currentQuestion.type === 'multiple-choice' && (
                        <RadioGroup
                            onValueChange={handleAnswerSelected}
                            value={answers[currentQuestion.id] || ""}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                            disabled={answerStatus !== 'unanswered'}
                        >
                          {currentQuestion.options.map((option, index) => (
                            <Label 
                                key={`${option}-${index}`}
                                htmlFor={`${option}-${index}`}
                                className={cn(
                                  "flex items-center space-x-3 p-4 rounded-lg border-2 border-border has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 cursor-pointer transition-all",
                                  answerStatus !== 'unanswered' &&
                                      (Array.isArray(currentQuestion.correctAnswer)
                                      ? currentQuestion.correctAnswer.includes(option)
                                      : currentQuestion.correctAnswer === option) &&
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
                        <div className="flex flex-col gap-4">
                          <div className="relative [perspective:1000px]" style={{ minHeight: '160px' }}>
                            <div
                                className={cn(
                                    "relative w-full h-full [transform-style:preserve-3d] transition-transform duration-1000",
                                    "min-h-[160px]",
                                    flippedQuestions[currentQuestion.id] && "[transform:rotateY(180deg)]"
                                )}
                            >
                                {/* Front face with textarea */}
                                <div className="absolute w-full h-full [backface-visibility:hidden]">
                                    <Textarea
                                        placeholder="Escribe tu respuesta aquí, mi chula..."
                                        className="h-full text-base min-h-[160px]"
                                        value={answers[currentQuestion.id] || ""}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                                        disabled={!!flippedQuestions[currentQuestion.id]}
                                    />
                                </div>

                                {/* Back face with creator's answer */}
                                <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-primary/10 p-4 sm:p-6 rounded-lg flex flex-col text-center overflow-y-auto">
                                  <p className="text-foreground/80 italic text-base sm:text-lg whitespace-pre-wrap my-auto">
                                    &ldquo;{currentQuestion.creatorAnswer}&rdquo;
                                  </p>
                                </div>
                            </div>
                          </div>
                          <Button 
                              onClick={handleNext} 
                              className="w-full h-12 text-lg font-bold"
                              disabled={!answers[currentQuestion.id] && !flippedQuestions[currentQuestion.id]}
                          >
                            {flippedQuestions[currentQuestion.id] ? 'Continuar' : 'Revelar mi respuesta'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column: Stats & Actions */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-card/50 dark:bg-zinc-800/30 border border-border p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <CircularProgress current={score} total={multipleChoiceQuestions.length} />
                </div>

                <div className="bg-card/50 dark:bg-zinc-800/30 border border-border p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Correctas</span>
                      <span className="text-lg font-bold text-foreground">{score}</span>
                    </div>
                  </div>
                </div>

                <div className={cn(
                  "bg-card/50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-dashed transition-colors",
                  isGameWon ? "border-green-500/50" : "border-primary/20"
                )}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                      isGameWon ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                    )}>
                      {isGameWon ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <h3 className={cn(
                      "font-bold transition-colors",
                      isGameWon ? "text-green-600 dark:text-green-400" : "text-foreground"
                    )}>
                      {isGameWon ? 'Pista 3: Desbloqueada' : 'Pista 3: Bloqueada'}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground italic pl-11 mb-4">
                    "Las respuestas sinceras iluminan el camino. ¿Recuerdas bien nuestros momentos?"
                  </p>
                  <div className="pl-11">
                      <div className="flex justify-between items-center text-xs font-medium text-muted-foreground mb-1">
                          <p>{isGameWon ? 'DESBLOQUEADO' : 'PROGRESO'}</p>
                          <p>{Math.min(100, Math.round(hintProgress))}%</p>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full">
                          <div className={cn("h-full rounded-full", isGameWon ? "bg-green-500" : "bg-primary")} style={{ width: `${Math.min(100, hintProgress)}%` }} />
                      </div>
                  </div>
                </div>
                
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex gap-2 items-center text-xs font-medium text-primary">
                    <Info className="h-4 w-4 shrink-0"/>
                    Lee con atención y elige la mejor opción.
                  </div>
                </div>

                {/* Action Button/Feedback */}
                 <div className="pt-4 min-h-[6rem]">
                    {currentQuestion.type === 'multiple-choice' && (
                        <>
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
                                </div>
                            )}
                        </>
                    )}
                 </div>

              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <>
      {renderMainContent()}
      <InstructionsModal 
        isOpen={isInstructionsModalOpen} 
        onOpenChange={setInstructionsModalOpen} 
        onStartGame={handleStartGame} 
      />
      <RomanticLetterModal
        isOpen={!!letterToShow}
        letter={letterToShow}
        onClose={() => {
          setLetterToShow(null);
          goToNextQuestion();
        }}
      />
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setMapModalOpen(false)}
        onNextChallenge={handleOpenKeywordModal}
        coordinates={coordinates}
        googleMapsUrl={googleMapsUrl}
        iframeUrl={iframeUrl}
        title="¡Tercera Pista Desbloqueada!"
        description={
          <>
            <p>¡Ya vas a mitad de camino! La siguiente pista la tengo yo, así que ven a la florería para conocer la siguiente palabra para poder continuar.</p>
            <p className="font-bold text-primary mt-2">📍 Tercera pista: Florería Florarte.</p>
          </>
        }
      />
      <KeywordModal
        isOpen={isKeywordModalOpen}
        onSuccess={handleKeywordSuccess}
        onBack={handleReturnToMap}
        correctKeyword="Nunca"
        title="Tercera Palabra Clave"
        description="Has encontrado la tercera pista. Ingresa la palabra clave para desbloquear el siguiente desafío."
      />
    </>
  );
}
