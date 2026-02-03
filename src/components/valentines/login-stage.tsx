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
                    <PopoverContent
                        align="start"
                        className="w-auto rounded-2xl border border-border bg-background p-4 shadow-xl"
                    >
                      <Calendar
                        mode="single"
                        locale={es}
                        selected={
                          field.value
                            ? new Date(
                                field.value.split('/').reverse().join('-') + 'T12:00:00'
                              )
                            : undefined
                        }
                        onSelect={(date) => {
                          field.onChange(date ? format(date, 'dd/MM/yyyy') : '');
                          setIsCalendarOpen(false);
                        }}
                        formatters={{
                          formatShortWeekday: (day) =>
                            format(day, 'EEEEEE', { locale: es }).slice(0, 2),
                        }}
                        initialFocus
                        classNames={{
                            root: 'p-0',
                            months: 'flex justify-center',
                            month: 'space-y-4',
                            caption: 'flex justify-center relative items-center',
                            caption_label:
                              'text-lg font-semibold text-primary capitalize',
                            nav: 'space-x-1 flex items-center',
                            nav_button:
                              'h-8 w-8 rounded-full hover:bg-primary/10',
                            nav_button_previous: 'absolute left-1',
                            nav_button_next: 'absolute right-1',
                          
                            table: 'w-full border-collapse',
                            head_row: 'grid grid-cols-7',
                            head_cell:
                              'text-muted-foreground text-xs font-medium text-center uppercase',
                          
                            row: 'grid grid-cols-7 mt-2',
                            cell: 'relative flex items-center justify-center',
                          
                            day:
                              'h-10 w-10 rounded-full text-sm font-normal hover:bg-primary/10',
                          
                            day_selected:
                              'bg-primary text-primary-foreground hover:bg-primary',
                          
                            day_today:
                              'border border-primary text-primary',
                          
                            day_outside:
                              'text-muted-foreground/30 pointer-events-none opacity-30',
                          }}
                          components={{
                            DayContent: ({ date }) => {
                              const isFourteen = date.getDate() === 14;
                              return (
                                <div className="flex items-center justify-center w-full h-full">
                                  {isFourteen ? (
                                    <Heart className="h-5 w-5 text-primary fill-primary" />
                                  ) : (
                                    date.getDate()
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
