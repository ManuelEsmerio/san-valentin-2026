'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const formSchema = z.object({
  nickname: z.string().min(1, 'Dime quién eres...'),
  anniversary: z.date({
    required_error: 'Por favor, elige nuestra fecha especial.',
  }),
});

export default function LoginStage({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: '',
      anniversary: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const isNicknameCorrect =
      values.nickname.trim().toLowerCase() === 'mi chula';

    const correctDate = new Date('2025-04-13T00:00:00');
    const selectedDate = values.anniversary;

    const isDateCorrect =
      selectedDate &&
      selectedDate.getFullYear() === correctDate.getFullYear() &&
      selectedDate.getMonth() === correctDate.getMonth() &&
      selectedDate.getDate() === correctDate.getDate();

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
                    Nuestra fecha
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'h-14 pl-12 pr-4 text-base w-full justify-start text-left font-normal border-input bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none">
                            calendar_month
                          </span>
                          {field.value ? (
                            format(field.value, 'dd / MM / yyyy')
                          ) : (
                            <span>Selecciona nuestro aniversario</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 border-primary/10 shadow-2xl"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={es}
                        defaultMonth={new Date(2025, 3)}
                        classNames={{
                          caption: 'flex justify-between items-center mb-4 px-1',
                          caption_label: 'text-primary font-bold text-lg',
                          nav_button:
                            'h-8 w-8 p-0 bg-transparent hover:bg-primary/5 rounded-full text-primary disabled:opacity-50',
                          nav_button_previous: '',
                          nav_button_next: '',
                        }}
                        components={{
                          IconLeft: (props) => <ChevronLeft {...props} />,
                          IconRight: (props) => <ChevronRight {...props} />,
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
