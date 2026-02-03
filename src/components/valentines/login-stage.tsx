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

const formSchema = z.object({
  nickname: z.string().min(1, 'Dime quién eres...'),
  anniversary: z.string().min(1, 'Por favor, elige nuestra fecha especial.'),
});

export default function LoginStage({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: '',
      anniversary: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const isNicknameCorrect =
      values.nickname.trim().toLowerCase() === 'mi chula';
    const isDateCorrect = values.anniversary.trim() === '13/04/2025';

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
                                format(new Date(field.value.split('/').reverse().join('-')+'T12:00:00'), 'PPP', { locale: es })
                            ) : (
                                <span>Elige una fecha</span>
                            )}
                           </span>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 bg-background border border-border rounded-xl" align="start">
                      <Calendar
                        mode="single"
                        locale={es}
                        selected={field.value ? new Date(field.value.split('/').reverse().join('-') + 'T12:00:00') : undefined}
                        onSelect={(date) => {
                            field.onChange(date ? format(date, 'dd/MM/yyyy') : '');
                            setIsCalendarOpen(false);
                        }}
                        month={new Date(2025, 3)}
                        formatters={{
                          formatShortWeekday: (day) => format(day, 'EEEEEE', { locale: es }).slice(0, 2),
                        }}
                        disabled={(date) =>
                          date > new Date('2026-01-01') || date < new Date('2024-01-01')
                        }
                        initialFocus
                        classNames={{
                          root: 'p-0',
                          month: 'space-y-4',
                          caption: 'flex flex-col items-start relative mb-4 h-12',
                          caption_label: 'text-base font-medium capitalize',
                          nav: 'space-x-1 flex items-center absolute top-7',
                          nav_button: 'h-7 w-7 bg-transparent p-0 opacity-80 hover:opacity-100',
                          table: 'w-full border-collapse',
                          head_row: 'flex',
                          head_cell: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] capitalize',
                          row: 'flex w-full mt-2',
                          cell: 'h-8 w-8 text-center text-sm p-0 relative',
                          day: 'h-8 w-8 p-0 font-normal aria-selected:opacity-100 rounded-md',
                          day_selected:
                            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                          day_today: 'bg-accent text-accent-foreground',
                          day_outside: 'text-muted-foreground/50',
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
