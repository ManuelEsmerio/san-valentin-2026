'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import RomanticCalendar from '@/components/valentines/RomanticCalendar';
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
  nickname: z.string().min(1, 'Por favor, ingresa tu apodo.'),
  anniversary: z.date({
    required_error: 'Por favor, elige una fecha.',
    invalid_type_error: 'Esa no parece ser una fecha válida.',
  }),
});

const acceptedNicknames = ['mi chula', 'chula'];

type LoginStageProps = {
  onSuccess: (nickname: string) => void;
};

export default function LoginStage({ onSuccess }: LoginStageProps) {
  const { toast } = useToast();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const normalizedNickname = values.nickname.trim().toLowerCase();
    const isNicknameCorrect = acceptedNicknames.includes(normalizedNickname) || normalizedNickname === 'manuel';
    
    let isDateCorrect = false;
    if (values.anniversary) {
      const day = values.anniversary.getDate();
      const month = values.anniversary.getMonth() + 1; // getMonth() is 0-indexed
      if (day === 13 && month === 4) {
        isDateCorrect = true;
      }
    }

    // Dev mode to bypass date check for easier testing
    if (normalizedNickname === 'manuel') {
      isDateCorrect = true;
    }

    if (isNicknameCorrect && isDateCorrect) {
      onSuccess(normalizedNickname);
    } else {
      toast({
        variant: 'destructive',
        title: 'Inténtalo de nuevo, mi chula',
        description:
          'Una de las respuestas no es correcta, pero sé que la sabes. 😉',
      });
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden border border-primary/5">
      <div className="bg-pink-50/50 dark:bg-pink-900/10 pt-10 pb-6 flex flex-col items-center justify-center space-y-2">
        <div className="relative">
          <span className="material-symbols-rounded text-primary text-4xl transform -rotate-12">celebration</span>
          <div className="flex gap-1 mt-1">
            <span className="material-symbols-rounded text-primary/40 text-sm">favorite</span>
            <span className="material-symbols-rounded text-primary/60 text-base">favorite</span>
            <span className="material-symbols-rounded text-primary/40 text-sm">favorite</span>
          </div>
        </div>
      </div>
      <div className="px-8 pb-10 pt-4 text-center">
        <h1 className="text-4xl font-serif text-slate-900 dark:text-white mb-2">¡Hola!</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-10">¿Preparada para disfrutar de estos desafíos?</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-left">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Usuario
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" aria-label="Hint for user">
                          <span className="material-symbols-rounded text-xs text-slate-400 dark:text-slate-500">help_outline</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-60">
                        <p className="text-sm">
                          Pista: es el apodo con el cual te tengo registrada. 😉
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      <Input
                        className="w-full pl-12 pr-4 py-4 h-auto bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 text-sm transition-all"
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
                <FormItem>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Fecha
                    </label>
                     <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" aria-label="Hint for date">
                           <span className="material-symbols-rounded text-xs text-slate-400 dark:text-slate-500">help_outline</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-60">
                        <p className="text-sm">
                          Pista: Es la fecha de nuestro <span className="italic text-primary font-semibold">aniversario</span>.
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <button
                          type="button"
                          className={cn(
                            'w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-4 rounded-2xl shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-3 transition-all active:scale-95',
                            !field.value && 'text-opacity-70'
                          )}
                        >
                          <span className="material-symbols-rounded text-xl">calendar_today</span>
                           <span>
                            {field.value ? (
                                format(field.value, 'PPP', { locale: es })
                            ) : (
                                <span>Elige una fecha</span>
                            )}
                           </span>
                        </button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                        align="start"
                        className="w-auto p-0 border-none bg-transparent shadow-none"
                    >
                      <RomanticCalendar
                        selected={field.value}
                        onSelect={(date) => {
                            field.onChange(date);
                            setIsCalendarOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-magenta text-white font-bold py-4 h-auto rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-2 group transition-all mt-8"
              >
                <span>Entrar</span>
                <span className="material-symbols-rounded transition-transform group-hover:translate-x-1">arrow_forward</span>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
