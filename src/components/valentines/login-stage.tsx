'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';

const formSchema = z.object({
  nickname: z.string().min(1, 'Dime quién eres...'),
  anniversary: z.date({
    required_error: 'Por favor, elige nuestra fecha especial.',
    invalid_type_error: 'Esa no parece ser una fecha válida.',
  }),
});

export default function LoginStage({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const isNicknameCorrect =
      values.nickname.trim().toLowerCase() === 'mi chula';

    let isDateCorrect = false;
    if (values.anniversary) {
      const day = values.anniversary.getDate();
      const month = values.anniversary.getMonth() + 1; // getMonth() is 0-indexed
      if (day === 13 && month === 4) {
        isDateCorrect = true;
      }
    }

    if (isNicknameCorrect && isDateCorrect) {
      onSuccess();
    } else {
      toast({
        variant: 'destructive',
        title: 'Inténtalo de nuevo, mi amor',
        description:
          'Una de las respuestas no es correcta, pero sé que la sabes. 😉',
      });
    }
  }

  return (
    <div className="w-full bg-card dark:bg-stone-900 rounded-xl shadow-xl overflow-hidden border border-primary/5">
      <div className="p-1">
        <div className="w-full h-48 bg-gradient-to-br from-pink-50 to-white dark:from-stone-800 dark:to-stone-900 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-primary text-6xl">
              celebration
            </span>
            <div className="flex gap-2">
              <span className="material-symbols-outlined text-primary/40 text-xl">
                favorite
              </span>
              <span className="material-symbols-outlined text-primary/40 text-xl">
                favorite
              </span>
              <span className="material-symbols-outlined text-primary/40 text-xl">
                favorite
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-8 pb-10 pt-6">
        <h2 className="text-foreground text-3xl font-bold leading-tight tracking-[-0.015em] mb-2 text-center">
          Hola Amor
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          Comencemos nuestro viaje juntos. Por favor, verifica tu amor.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <label className="text-foreground text-base font-medium leading-normal pb-2">
                    ¿Cómo te digo?
                  </label>
                  <FormControl>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50">
                        person_heart
                      </span>
                      <Input
                        className="h-14 pl-12 pr-4 text-base bg-card focus:border-primary border-border"
                        placeholder="Tu apodo especial"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="anniversary"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <label className="text-foreground text-base font-medium leading-normal pb-2">
                    Nuestra fecha especial
                  </label>
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'h-14 pl-3 text-left font-normal text-base relative',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50">
                            calendar_month
                          </span>
                           <span className='pl-8'>
                            {field.value ? (
                                format(field.value, 'PPP', { locale: es })
                            ) : (
                                <span>Elige una fecha</span>
                            )}
                           </span>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                        align="start"
                        className="w-auto rounded-2xl border border-border bg-background p-4 shadow-xl"
                    >
                      <Calendar
                        mode="single"
                        locale={es}
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setIsCalendarOpen(false);
                        }}
                        formatters={{
                          formatShortWeekday: (day) =>
                            format(day, 'EEEEEE', { locale: es }).slice(0, 2),
                        }}
                        initialFocus
                        classNames={{
                            // Use p-0 on the root and control padding on the PopoverContent.
                            root: 'p-0',
                            
                            // Center the month block.
                            months: 'flex flex-col sm:flex-row justify-center',
                            month: 'space-y-4',

                            // Style the caption (e.g., "Febrero 2024").
                            caption: 'flex justify-center pt-1 relative items-center',
                            caption_label:
                              'text-lg font-semibold text-primary capitalize',
                            
                            // Style the navigation buttons.
                            nav: 'space-x-1 flex items-center',
                            nav_button:
                              'h-8 w-8 rounded-full bg-transparent hover:bg-primary/10 flex justify-center items-center',
                            nav_button_previous: 'absolute left-1',
                            nav_button_next: 'absolute right-1',
                          
                            // Use flex for rows to ensure proper alignment. This is the shadcn way.
                            table: 'w-full border-collapse space-y-1',
                            head_row: 'flex',
                            row: 'flex w-full mt-2',

                            // Style the weekday headers (LU, MA, etc.).
                            head_cell:
                              'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                            
                            // Style each day's container cell.
                            cell: 'h-10 w-10 text-center text-sm p-0 relative flex items-center justify-center',
                          
                            // Style the day button itself.
                            day:
                              'h-10 w-10 rounded-full text-sm font-normal hover:bg-primary/10',
                          
                            // Style for the selected day.
                            day_selected:
                              'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary focus:text-primary-foreground',
                          
                            // Style for today's date.
                            day_today:
                              'bg-accent text-accent-foreground',
                          
                            // Make days outside the current month very subtle.
                            day_outside:
                              'text-muted-foreground/50 opacity-50',
                            
                            day_disabled: 'text-muted-foreground opacity-50',
                            day_hidden: 'invisible',
                          }}
                          components={{
                            // Use DayContent to inject custom elements without breaking layout.
                            DayContent: ({ date }) => {
                              // Mark the 14th of any month with a heart.
                              const isFourteen = date.getDate() === 14;
                              return (
                                <div className="flex items-center justify-center w-full h-full relative">
                                  {date.getDate()}
                                  {isFourteen && (
                                    <Heart className="h-3 w-3 absolute text-primary/70 top-1 right-1" fill="currentColor" />
                                  )}
                                </div>
                              );
                            },
                          }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-14 px-4 text-lg font-bold shadow-lg shadow-primary/20"
              >
                <span className="truncate">Entrar</span>
                <span className="material-symbols-outlined ml-2">
                  arrow_forward
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
