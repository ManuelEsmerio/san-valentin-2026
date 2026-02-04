'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { HelpCircle } from 'lucide-react';

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
          Hola!
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          ¿Preparada para disfrutar de estos desafíos?
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2 pb-2">
                    <label className="text-foreground text-base font-medium leading-none">
                      Usuario
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" aria-label="Hint for user">
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
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
                  <div className="flex items-center gap-2 pb-2">
                    <label className="text-foreground text-base font-medium leading-none">
                      Fecha
                    </label>
                     <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" aria-label="Hint for date">
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
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
