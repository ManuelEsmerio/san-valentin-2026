import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import ThemeToggle from '@/components/valentines/theme-toggle';
import MusicPlayer from '@/components/valentines/MusicPlayer';

export const metadata: Metadata = {
  title: "Para Mariana",
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
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23E91E63'><path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/></svg>" />
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
        <header className="flex items-center justify-between px-4 sm:px-10 py-6 w-full">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
            </span>
            <h2 className="text-primary text-xl font-bold">
              Para Mariana
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
