import { cn } from '@/lib/utils';

export default function StageLoading() {
  return (
    <div className={cn(
      'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300 animate-fade-in'
    )}>
      <div className="flex flex-col items-center gap-4">
        <span
          className="material-symbols-rounded text-primary text-7xl animate-heart-beat"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          favorite
        </span>
        <p className="text-primary font-medium tracking-wider">Cargando...</p>
      </div>
    </div>
  );
}
