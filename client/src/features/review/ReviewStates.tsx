import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const pageClass = "px-5 pt-6 pb-28 max-w-lg mx-auto min-h-[calc(100vh-4rem)]";

export function ReviewLoadingState() {
  return (
    <div className={`${pageClass} flex flex-col`}>
      {/* mode toggle */}
      <Skeleton className="h-10 w-full rounded-xl mb-3" />
      {/* progress bar */}
      <Skeleton className="h-2 w-full rounded-full mb-6" />
      {/* card */}
      <div className="flex-1 flex items-center justify-center">
        <Skeleton className="w-full h-52 rounded-3xl" />
      </div>
      {/* nav buttons */}
      <div className="flex justify-between pt-4">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-9 w-9 rounded-xl" />
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
      <p className="text-sm text-muted-foreground text-center">
        No cards are due right now. Check back later.
      </p>
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
}

export function ReviewSessionCompleteState({ total }: ReviewSessionCompleteStateProps) {
  const navigate = useNavigate();
  return (
    <div className={`${pageClass} flex flex-col items-center justify-center gap-4`}>
      <div className="text-4xl">🎉</div>
      <p className="text-lg font-semibold">Session Complete</p>
      <p className="text-sm text-muted-foreground text-center">
        You reviewed {total} {total === 1 ? "card" : "cards"}.
      </p>
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors cursor-pointer"
        >
          Back to Home
        </button>
        <button
          type="button"
          onClick={() => navigate("/words/new")}
          className="px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
        >
          Add New Words
        </button>
      </div>
    </div>
  );
}
