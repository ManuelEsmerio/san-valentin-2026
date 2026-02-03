import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import ThemeToggle from '@/components/valentines/theme-toggle';
import MusicPlayer from '@/components/valentines/MusicPlayer';

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
    <html lang="es" suppressHydrationWarning>
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
        <div className="fixed inset-0 pointer-events-none -z-10">
            <span className="material-symbols-outlined text-primary/10 absolute top-[15%] left-[10%] text-7xl opacity-50">favorite</span>
            <span className="material-symbols-outlined text-primary/10 absolute top-[25%] right-[5%] text-5xl opacity-50">favorite</span>
            <span className="material-symbols-outlined text-primary/10 absolute bottom-[15%] left-[20%] text-6xl opacity-50">favorite</span>
            <span className="material-symbols-outlined text-primary/10 absolute bottom-[25%] right-[15%] text-8xl opacity-50">favorite</span>
            <span className="material-symbols-outlined text-primary/10 absolute top-[20%] left-[40%] text-2xl animate-pulse">favorite</span>
            <span className="material-symbols-outlined text-primary/10 absolute top-[60%] right-[30%] text-xl animate-pulse">favorite</span>
            <span className="material-symbols-outlined text-primary/10 absolute bottom-[30%] left-[50%] text-3xl animate-pulse">favorite</span>
        </div>
        <header className="flex items-center justify-between px-4 sm:px-10 py-6 w-full">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
            </span>
            <h2 className="text-primary text-xl font-bold">
              Valentine's Challenge
            </h2>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {children}
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
        <MusicPlayer />
      </body>
    </html>
  );
}
