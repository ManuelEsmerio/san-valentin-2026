'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

type Props = {
  onSuccess: () => void;
};

export default function CatchHeartsStage({ onSuccess }: Props) {
  return (
    <Card className="w-full max-w-lg text-center animate-fade-in">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
          <Construction className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="mt-4">Desafío en Construcción</CardTitle>
        <CardDescription>
          Este desafío aún no está listo. ¡Pero puedes continuar con la aventura!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onSuccess}>Continuar al siguiente desafío</Button>
      </CardContent>
    </Card>
  );
}
