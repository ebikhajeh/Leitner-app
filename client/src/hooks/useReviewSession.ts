import { useState, useEffect } from "react";
import { useDueWords } from "@/hooks/useDueWords";
import { useReviewWord } from "@/hooks/useReviewWord";
import type { ReviewPhase, Difficulty } from "@/features/review/ReviewCard";
import type { ReviewMode, Word } from "@/features/review/types";

const MAX_HARD_REPEATS = 5;

export function useReviewSession() {
  const { data: words, isLoading, isFetching, isError } = useDueWords();
  const { mutate: reviewWord, isPending } = useReviewWord();

  const [sessionCards, setSessionCards] = useState<Word[] | null>(null);
  const [initialCount, setInitialCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<ReviewPhase>("recall");
  const [mode, setMode] = useState<ReviewMode>("normal");
  const [hardRepeatCounts, setHardRepeatCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (words !== undefined && !isFetching && sessionCards === null) {
      setSessionCards(words);
      setInitialCount(words.length);
      setCurrentIndex(0);
    }
  }, [words, isFetching, sessionCards]);

  const resetSession = () => {
    setSessionCards(null);
    setCurrentIndex(0);
    setPhase("recall");
    setHardRepeatCounts(new Map());
  };

  const navigate = (next: number) => {
    setCurrentIndex(next);
    setPhase("recall");
  };

  const handleModeChange = (next: ReviewMode) => {
    setMode(next);
    setPhase("recall");
  };

  const handleDifficulty = (difficulty: Difficulty) => {
    if (!sessionCards) return;
    const card = sessionCards[currentIndex];
    reviewWord({ wordId: card.id, difficulty });

    const without = sessionCards.filter(w => w.id !== card.id);
    const hardCount = hardRepeatCounts.get(card.id) ?? 0;

    if (difficulty === "hard" && hardCount < MAX_HARD_REPEATS) {
      // Requeue at end until the user rates Medium/Easy or the repeat cap is hit.
      setSessionCards([...without, card]);
      setCurrentIndex(i => Math.max(0, Math.min(i, without.length - 1)));
      setHardRepeatCounts(prev => new Map(prev).set(card.id, hardCount + 1));
    } else {
      setSessionCards(without);
      setCurrentIndex(i => Math.max(0, Math.min(i, without.length - 1)));
    }

    setPhase("recall");
  };

  const total = sessionCards?.length ?? 0;
  const card = sessionCards?.[currentIndex] ?? null;

  const prev = () => navigate(Math.max(currentIndex - 1, 0));
  const next = () => navigate(Math.min(currentIndex + 1, total - 1));

  return {
    isLoading,
    isFetching,
    isError,
    sessionCards,
    initialCount,
    currentIndex,
    phase,
    mode,
    isPending,
    card,
    total,
    onReveal: () => setPhase("revealed"),
    resetSession,
    handleModeChange,
    handleDifficulty,
    prev,
    next,
  };
}
