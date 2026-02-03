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
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DayPicker, DayProps } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const formSchema = z.object({
  nickname: z.string().min(1, 'Dime quién eres...'),
  anniversary: z.date({
    required_error: 'Por favor, elige nuestra fecha especial.',
  }),
});

type LoginStageProps = {
  onSuccess: () => void;
};

function CustomDay({ date, ...props }: DayProps) {
  if (props.modifiers.hidden) {
    return <div className="h-8 w-8"></div>;
  }

  const content = <span className="relative z-10">{format(date, 'd')}</span>;

  if (props.modifiers.selected) {
    return (
      <div
        className={cn(
          'relative flex h-8 w-8 cursor-pointer items-center justify-center text-white',
          props.className
        )}
        {...props.buttonProps}
      >
        <span
          className="material-symbols-outlined text-primary text-3xl absolute z-0"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          favorite
        </span>
        <span className="relative z-10 text-[10px] font-bold">
          {format(date, 'd')}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      {...props.buttonProps}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg hover:bg-pink-50 dark:hover:bg-stone-700',
        {
          'cursor-pointer': !props.modifiers.disabled,
          'opacity-50 cursor-not-allowed': props.modifiers.disabled,
          'text-muted-foreground opacity-50': props.modifiers.outside,
        },
        props.className
      )}
    >
      {content}
    </button>
  );
}

export default function LoginStage({ onSuccess }: LoginStageProps) {
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

    const correctDate = new Date(2025, 3, 13);
    const selectedDate = values.anniversary;

    const isDateCorrect =
      selectedDate &&
      selectedDate.getDate() === correctDate.getDate() &&
      selectedDate.getMonth() === correctDate.getMonth() &&
      selectedDate.getFullYear() === correctDate.getFullYear();

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
                            'h-14 pl-12 pr-4 text-base bg-card focus:border-primary border-border justify-start font-normal text-left relative',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50">
                            calendar_month
                          </span>
                          {field.value ? (
                            format(field.value, 'dd / MM / yyyy')
                          ) : (
                            <span>DD / MM / YYYY</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-card border-primary/10 rounded-xl shadow-2xl"
                      align="start"
                    >
                      <DayPicker
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={{ before: new Date(2020, 0, 1) }}
                        defaultMonth={new Date(2025, 3)}
                        locale={es}
                        classNames={{
                          root: 'p-4',
                          caption: 'flex items-center justify-between mb-4',
                          caption_label: 'text-primary font-bold',
                          nav_button:
                            'h-7 w-7 p-1 hover:bg-primary/5 rounded-full text-primary',
                          head_row:
                            'grid grid-cols-7 text-center text-xs font-medium text-muted-foreground mb-2',
                          head_cell: 'w-auto font-normal',
                          row: 'grid grid-cols-7',
                          cell: 'p-0',
                        }}
                        components={{
                          IconLeft: () => <ChevronLeft className="h-6 w-6" />,
                          IconRight: () => <ChevronRight className="h-6 w-6" />,
                          Day: CustomDay,
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
