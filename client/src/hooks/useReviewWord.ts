import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Difficulty } from "@/features/review/ReviewCard";

export function useReviewWord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ wordId, difficulty }: { wordId: string; difficulty: Difficulty }) =>
      api.patch(`/words/${wordId}/review`, { difficulty }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["words", "due"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
