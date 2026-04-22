import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWords } from "@/hooks/useWords";
import { ReviewCard } from "@/features/review/ReviewCard";
import { ReviewProgress } from "@/features/review/ReviewProgress";
import { ReviewLoadingState, ReviewErrorState, ReviewEmptyState } from "@/features/review/ReviewStates";

export default function ReviewPage() {
  const { data: words, isLoading, isError } = useWords();
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => Math.max(i - 1, 0));
  const next = () => setIndex((i) => Math.min(i + 1, (words?.length ?? 1) - 1));

  if (isLoading) return <ReviewLoadingState />;
  if (isError) return <ReviewErrorState />;
  if (!words || words.length === 0) return <ReviewEmptyState />;

  const card = words[index];
  const total = words.length;

  return (
    <div className="px-5 pt-6 pb-28 max-w-lg mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
      <ReviewProgress current={index + 1} total={total} />

      {/* Card */}
      <div className="flex-1 flex items-center justify-center">
        <ReviewCard word={card} />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" size="icon" onClick={prev} disabled={index === 0} className="rounded-xl">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={next} disabled={index === total - 1} className="rounded-xl">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
