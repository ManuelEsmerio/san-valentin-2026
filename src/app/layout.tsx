import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: "Valentine's Challenge",
  description: 'Un desafío de 3 pasos para mi amor.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <div className="fixed inset-0 heart-pattern pointer-events-none -z-10"></div>
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 bg-card/50 backdrop-blur-sm px-4 sm:px-10 py-3 sticky top-0 z-50">
          <div className="flex items-center gap-4 text-primary">
            <span className="material-symbols-outlined text-3xl">favorite</span>
            <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em]">
              Valentine's Challenge
            </h2>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <div className="w-full max-w-[960px] flex flex-col items-center">
            {children}
          </div>
        </main>
        <footer className="py-6 text-center text-muted-foreground text-sm">
          <p className="flex items-center justify-center">
            Made with{' '}
            <span className="material-symbols-outlined text-xs align-middle mx-1">
              favorite
            </span>{' '}
            for someone special
          </p>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
