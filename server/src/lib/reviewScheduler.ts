export type Difficulty = "hard" | "medium" | "easy";

const LEVEL_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60];
const MIN_LEVEL = 1;
const MAX_LEVEL = LEVEL_INTERVALS_DAYS.length;

export function scheduleNextReview(currentLevel: number, difficulty: Difficulty) {
  const newLevel =
    difficulty === "easy" ? Math.min(currentLevel + 1, MAX_LEVEL) :
    difficulty === "hard" ? Math.max(currentLevel - 1, MIN_LEVEL) :
    currentLevel;

  // Normalise to UTC midnight so scheduling is timezone-independent.
  // Cards become available from 00:00 UTC on the target day (which is
  // the evening of the previous day in UTC-offset timezones like Canada).
  const nextReviewAt = new Date();
  nextReviewAt.setUTCHours(0, 0, 0, 0);
  nextReviewAt.setUTCDate(nextReviewAt.getUTCDate() + LEVEL_INTERVALS_DAYS[newLevel - 1]);

  return { box: newLevel, nextReviewAt };
}
