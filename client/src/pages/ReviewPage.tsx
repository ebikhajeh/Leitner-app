import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReviewSession } from "@/hooks/useReviewSession";
import { ReviewCard } from "@/features/review/ReviewCard";
import { ReviewProgress } from "@/features/review/ReviewProgress";
import { ReviewModeToggle } from "@/features/review/ReviewModeToggle";
import {
  ReviewLoadingState,
  ReviewErrorState,
  ReviewNoDueState,
  ReviewSessionCompleteState,
} from "@/features/review/ReviewStates";

export default function ReviewPage() {
  const {
    isLoading, isFetching, isError,
    sessionCards, initialCount, currentIndex,
    phase, mode, isPending, card, total,
    onReveal, resetSession, handleModeChange, handleDifficulty, prev, next,
  } = useReviewSession();

  if (isLoading || (sessionCards === null && isFetching)) return <ReviewLoadingState />;
  if (isError) return <ReviewErrorState />;
  if (sessionCards === null) return <ReviewLoadingState />;
  if (sessionCards.length === 0) {
    if (initialCount > 0) return <ReviewSessionCompleteState total={initialCount} onRestart={resetSession} />;
    return <ReviewNoDueState />;
  }

  return (
    <div className="px-5 pt-6 pb-28 max-w-lg mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
      <ReviewModeToggle mode={mode} onChange={handleModeChange} />
      <ReviewProgress current={currentIndex + 1} total={total} />

      <div className="flex-1 flex items-center justify-center">
        <ReviewCard
          word={card!}
          phase={phase}
          mode={mode}
          onReveal={onReveal}
          onDifficulty={handleDifficulty}
          isPending={isPending}
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" size="icon" onClick={prev} disabled={currentIndex === 0} className="rounded-xl">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={next} disabled={currentIndex === total - 1} className="rounded-xl">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
