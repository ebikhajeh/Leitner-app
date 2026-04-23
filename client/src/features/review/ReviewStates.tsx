import { Skeleton } from "@/components/ui/skeleton";

const pageClass = "px-5 pt-6 pb-28 max-w-lg mx-auto min-h-[calc(100vh-4rem)]";

export function ReviewLoadingState() {
  return (
    <div className={`${pageClass} flex flex-col`}>
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="flex-1 flex items-center justify-center">
        <Skeleton className="w-full h-48 rounded-3xl" />
      </div>
    </div>
  );
}

export function ReviewErrorState() {
  return (
    <div className={`${pageClass} flex items-center justify-center`}>
      <p className="text-sm text-destructive">Failed to load words. Please try again.</p>
    </div>
  );
}

export function ReviewNoDueState() {
  return (
    <div className={`${pageClass} flex flex-col items-center justify-center gap-3`}>
      <p className="text-lg font-semibold">All caught up!</p>
      <p className="text-sm text-muted-foreground text-center">No cards are due right now. Check back later.</p>
    </div>
  );
}

export function ReviewEmptyState() {
  return (
    <div className={`${pageClass} flex flex-col items-center justify-center gap-3`}>
      <p className="text-lg font-semibold">No words yet</p>
      <p className="text-sm text-muted-foreground text-center">Add some words first to start reviewing.</p>
    </div>
  );
}

interface ReviewSessionCompleteStateProps {
  total: number;
  onRestart: () => void;
}

export function ReviewSessionCompleteState({ total, onRestart }: ReviewSessionCompleteStateProps) {
  return (
    <div className={`${pageClass} flex flex-col items-center justify-center gap-4`}>
      <div className="text-4xl">🎉</div>
      <p className="text-lg font-semibold">Session Complete</p>
      <p className="text-sm text-muted-foreground text-center">
        You reviewed {total} {total === 1 ? "card" : "cards"}.
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="mt-2 px-6 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
      >
        Review Again
      </button>
    </div>
  );
}
