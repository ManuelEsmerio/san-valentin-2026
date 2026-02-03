'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, sub, add, isSameDay, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type RomanticCalendarProps = {
  selected?: Date;
  onSelect: (date: Date) => void;
  specialDay?: number;
};

// Sunday is 0, Monday is 1, etc.
const WEEK_STARTS_ON = 1; // Start week on Monday

export default function RomanticCalendar({ selected, onSelect, specialDay = 14 }: RomanticCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);

  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const startingDayIndex = (getDay(firstDayOfMonth) - WEEK_STARTS_ON + 7) % 7;

  const handlePrevMonth = () => {
    setCurrentMonth(sub(currentMonth, { months: 1 }));
  };

  const handleNextMonth = () => {
    setCurrentMonth(add(currentMonth, { months: 1 }));
  };

  const handleDayClick = (day: Date) => {
    onSelect(day);
  };

  const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  return (
    <div className="p-4 bg-card rounded-2xl w-[340px] shadow-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handlePrevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-muted-foreground uppercase">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 mt-2">
        {Array.from({ length: startingDayIndex }).map((_, index) => (
          <div key={`empty-${index}`} className="h-10 w-10" />
        ))}
        {daysInMonth.map((day) => {
          const isSelected = selected && isSameDay(day, selected);
          const isSpecialDay = day.getDate() === specialDay;
          const isCurrentMonthDay = isSameMonth(day, currentMonth);

          return (
            <div key={day.toString()} className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                className={cn(
                  'h-10 w-10 flex items-center justify-center rounded-full text-sm font-normal transition-colors',
                  'hover:bg-primary/10',
                  !isCurrentMonthDay && 'text-muted-foreground/30 pointer-events-none',
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                  isSpecialDay && !isSelected && 'text-primary'
                )}
              >
                {isSpecialDay ? (
                  <Heart className="h-5 w-5" fill="currentColor" />
                ) : (
                  format(day, 'd')
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
