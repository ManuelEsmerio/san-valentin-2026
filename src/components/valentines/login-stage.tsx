"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";

const formSchema = z.object({
  nickname: z.string().min(1, "Dime quién eres..."),
  anniversary: z.string().min(1, "Un día importante para nosotros."),
});

type LoginStageProps = {
  onSuccess: () => void;
};

export default function LoginStage({ onSuccess }: LoginStageProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      anniversary: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const isNicknameCorrect =
      values.nickname.trim().toLowerCase() === "mi chula";
    const anniversaryLower = values.anniversary.toLowerCase();
    const isDateCorrect =
      anniversaryLower.includes("13") &&
      (anniversaryLower.includes("marzo") || anniversaryLower.includes("3"));

    if (isNicknameCorrect && isDateCorrect) {
      onSuccess();
    } else {
      toast({
        variant: "destructive",
        title: "Inténtalo de nuevo, mi amor",
        description:
          "Una de las respuestas no es correcta, pero sé que la sabes. 😉",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Desafío de 3 Pasos
        </CardTitle>
        <CardDescription className="font-body">
          Para continuar, responde a estas preguntas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Tu apodo especial</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Mi amorcito" {...field} />
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
                  <FormLabel className="font-body">
                    Nuestra fecha de aniversario
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 1 de enero" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full font-headline">
              <Heart className="mr-2 h-4 w-4" /> Entrar
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
