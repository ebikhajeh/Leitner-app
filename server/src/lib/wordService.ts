import { db } from "./db";
import { scheduleNextReview, type Difficulty } from "./reviewScheduler";
import { getSettings } from "./settingsService";

export function getWordsByUser(userId: string) {
  return db.word.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

function computeDueLimit(dailyReviewLimit: number, dailyDueCards: number | null): number {
  return dailyDueCards !== null
    ? Math.min(dailyDueCards, dailyReviewLimit)
    : dailyReviewLimit;
}

function baseFilter(userId: string, now: Date) {
  return { userId, nextReviewAt: { lte: now } };
}

function fetchDueCards(userId: string, now: Date, limit: number) {
  return db.word.findMany({
    where: { ...baseFilter(userId, now), lastReviewedAt: { not: null } },
    orderBy: { nextReviewAt: "asc" },
    take: limit,
  });
}

function fetchNewCards(userId: string, now: Date, limit: number) {
  return db.word.findMany({
    where: { ...baseFilter(userId, now), lastReviewedAt: null },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

export async function getDueWords(userId: string) {
  const { dailyReviewLimit, dailyDueCards } = await getSettings(userId);
  const now = new Date();

  const dueCards = await fetchDueCards(userId, now, computeDueLimit(dailyReviewLimit, dailyDueCards));
  const newLimit = dailyReviewLimit - dueCards.length;

  if (newLimit <= 0) return dueCards;

  const newCards = await fetchNewCards(userId, now, newLimit);
  return [...dueCards, ...newCards];
}

export async function reviewWord(wordId: string, userId: string, difficulty: Difficulty) {
  const word = await db.word.findFirst({ where: { id: wordId, userId } });
  if (!word) return null;
  const { box, nextReviewAt } = scheduleNextReview(word.box, difficulty);
  return db.word.update({
    where: { id: wordId },
    data: { box, nextReviewAt, lastReviewedAt: new Date(), reviewCount: { increment: 1 } },
  });
}

export function createWord(data: {
  word: string;
  meaning: string;
  exampleSentence: string | null;
  userId: string;
}) {
  return db.word.create({ data });
}
