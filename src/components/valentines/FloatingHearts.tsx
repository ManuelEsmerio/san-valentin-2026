'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<any[]>([]);

  useEffect(() => {
    // Using a more diverse set of hearts for a richer background
    setHearts([
      { left: '10%', delay: '0s', size: 'text-4xl', colorClass: 'text-primary/20' },
      { left: '20%', delay: '2s', size: 'text-6xl', colorClass: 'text-coral/20' },
      { left: '30%', delay: '4s', size: 'text-3xl', colorClass: 'text-gold/20' },
      { left: '40%', delay: '1s', size: 'text-5xl', colorClass: 'text-magenta/20' },
      { left: '50%', delay: '3s', size: 'text-4xl', colorClass: 'text-primary/15' },
      { left: '60%', delay: '0.5s', size: 'text-7xl', colorClass: 'text-coral/25' },
      { left: '70%', delay: '2.5s', size: 'text-2xl', colorClass: 'text-gold/15' },
      { left: '80%', delay: '5s', size: 'text-5xl', colorClass: 'text-magenta/25' },
      { left: '90%', delay: '1.5s', size: 'text-4xl', colorClass: 'text-primary/20' },
    ]);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden">
      {hearts.map((heart, i) => (
        <div
          key={i}
          className={cn('heart-float', heart.colorClass)}
          style={{ left: heart.left, animationDelay: heart.delay, top: '110vh' }}
        >
          <span
            className={cn('material-symbols-rounded', heart.size)}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
        </div>
      ))}
    </div>
  );
}
