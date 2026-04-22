import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWords } from "@/hooks/useWords";
import { ReviewCard, type ReviewPhase } from "@/features/review/ReviewCard";
import { ReviewProgress } from "@/features/review/ReviewProgress";
import { ReviewLoadingState, ReviewErrorState, ReviewEmptyState } from "@/features/review/ReviewStates";

export default function ReviewPage() {
  const { data: words, isLoading, isError } = useWords();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<ReviewPhase>("recall");

  if (isLoading) return <ReviewLoadingState />;
  if (isError) return <ReviewErrorState />;
  if (!words || words.length === 0) return <ReviewEmptyState />;

  const total = words.length;
  const card = words[currentIndex];

  const navigate = (next: number) => {
    setCurrentIndex(next);
    setPhase("recall");
  };

  const prev = () => navigate(Math.max(currentIndex - 1, 0));
  const next = () => navigate(Math.min(currentIndex + 1, total - 1));

  return (
    <div className="px-5 pt-6 pb-28 max-w-lg mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
      <ReviewProgress current={currentIndex + 1} total={total} />

      <div className="flex-1 flex items-center justify-center">
        <ReviewCard
          word={card}
          phase={phase}
          onReveal={() => setPhase("revealed")}
          onDifficulty={next}
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
