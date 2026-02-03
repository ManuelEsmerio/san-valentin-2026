'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, BookOpen, Image, MessageSquare } from 'lucide-react';

type CountdownStageProps = {
  onComplete: () => void;
};

const CountdownUnit = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-6xl md:text-7xl font-bold tracking-tight text-white">
      {value}
    </span>
    <span className="text-xs font-medium uppercase tracking-widest text-white/50">
      {label}
    </span>
  </div>
);

export default function CountdownStage({ onComplete }: CountdownStageProps) {
  const calculateTimeLeft = () => {
    const now = new Date();
    // The target date is February 4th of the current year.
    const targetDate = new Date(now.getFullYear(), 1, 4);

    const difference = +targetDate - +now;
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      // If the date is in the past, countdown is over.
      onComplete();
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize countdown on client to avoid hydration mismatch
    setTimeLeft(calculateTimeLeft());
  }, [onComplete]);

  useEffect(() => {
    if (!isClient) return;

    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white p-4 text-center bg-gradient-to-br from-[#2a0c14] to-[#1c080d]">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJ0cmFuc3BhcmVudCI+PC9yZWN0PjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIHg9IjAiIHk9IjAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTNSLDAuMDUpIj48L3JlY3Q+PC9zdmc+')]"></div>
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-bold mb-2">
          Happy Valentine's
        </h1>
        <h1 className="text-5xl md:text-7xl font-bold text-primary mb-4">
          Day, My Love
        </h1>
        <p className="max-w-md text-white/70 mb-12">
          Every melody reminds me of the beautiful moments we've shared together.
        </p>

        {isClient && (
          <div className="flex items-center gap-8 md:gap-16 mb-12">
            <CountdownUnit value={formatNumber(timeLeft.days || 0)} label="DÍAS" />
            <CountdownUnit value={formatNumber(timeLeft.hours || 0)} label="HORAS" />
            <CountdownUnit value={formatNumber(timeLeft.minutes || 0)} label="MINUTOS" />
            <CountdownUnit value={formatNumber(timeLeft.seconds || 0)} label="SEGUNDOS" />
          </div>
        )}

        <div className="flex gap-4">
          <Button size="lg" className="h-12 text-base font-bold bg-primary hover:bg-primary/90 rounded-full px-8 shadow-lg shadow-primary/20">
            <Heart className="mr-2 h-5 w-5" fill="white" />
            Open Surprise
          </Button>
          <Button size="lg" variant="ghost" className="h-12 text-base font-bold text-white/80 hover:bg-white/10 hover:text-white rounded-full px-8">
            Our Gallery
          </Button>
        </div>
      </div>
      
      <div className="relative z-10 mt-auto mb-8">
         <div className="flex items-center gap-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full py-2 px-6">
            <div className="flex flex-col items-center gap-2">
                <BookOpen className="h-5 w-5 text-white/70"/>
                <span className="text-xs text-white/50 font-medium">OUR STORY</span>
            </div>
             <div className="flex flex-col items-center gap-2">
                <Image className="h-5 w-5 text-white/70"/>
                <span className="text-xs text-white/50 font-medium">MEMORIES</span>
            </div>
             <div className="flex flex-col items-center gap-2">
                <MessageSquare className="h-5 w-5 text-white/70"/>
                <span className="text-xs text-white/50 font-medium">LOVE NOTES</span>
            </div>
         </div>
      </div>
    </div>
  );
}
