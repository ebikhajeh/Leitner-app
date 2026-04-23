import { db } from "./db";
import { scheduleNextReview, type Difficulty } from "./reviewScheduler";

export function getWordsByUser(userId: string) {
  return db.word.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

export function getDueWords(userId: string) {
  return db.word.findMany({
    where: { userId, nextReviewAt: { lte: new Date() } },
    orderBy: { nextReviewAt: "asc" },
  });
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
