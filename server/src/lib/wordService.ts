import { db } from "./db";

export function getWordsByUser(userId: string) {
  return db.word.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
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
