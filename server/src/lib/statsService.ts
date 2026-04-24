import { db } from "./db";

const MS_PER_DAY = 86_400_000;

type WordRow = { box: number; reviewCount: number; lastReviewedAt: Date | null };

function utcDayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function utcDayNumber(d: Date): number {
  return utcDayStart(d).getTime() / MS_PER_DAY;
}

function calculateRetention(reviewedCount: number, progressedCount: number): number {
  if (reviewedCount === 0) return 0;
  return Math.round((progressedCount / reviewedCount) * 100);
}

function calculateSessions(reviewDates: Date[]): number {
  return new Set(reviewDates.map(utcDayNumber)).size;
}

function calculateLeitnerBoxes(boxCounts: Record<number, number>) {
  return [1, 2, 3, 4, 5].map((box) => ({
    box,
    count: box === 5 ? (boxCounts[5] ?? 0) + (boxCounts[6] ?? 0) : (boxCounts[box] ?? 0),
  }));
}

function calculateWeeklyActivity(reviewDates: Date[]): number[] {
  const todayStart = utcDayStart(new Date());
  const dayOfWeek = todayStart.getUTCDay(); // 0 = Sun
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const mondayStart = new Date(todayStart.getTime() - mondayOffset * MS_PER_DAY);

  return Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(mondayStart.getTime() + i * MS_PER_DAY);
    const dayEnd = new Date(dayStart.getTime() + MS_PER_DAY);
    return reviewDates.filter((d) => d >= dayStart && d < dayEnd).length;
  });
}

export async function getStats(userId: string) {
  const words = await db.word.findMany({
    where: { userId },
    select: { box: true, reviewCount: true, lastReviewedAt: true },
  });

  let totalWords = 0;
  let reviewedCount = 0;
  let progressedCount = 0;
  const boxCounts: Record<number, number> = {};
  const reviewDates: Date[] = [];

  for (const w of words) {
    totalWords++;
    boxCounts[w.box] = (boxCounts[w.box] ?? 0) + 1;
    if (w.reviewCount > 0) {
      reviewedCount++;
      if (w.box > 1) progressedCount++;
    }
    if (w.lastReviewedAt) reviewDates.push(w.lastReviewedAt);
  }

  const mastered = (boxCounts[5] ?? 0) + (boxCounts[6] ?? 0);

  return {
    totalWords,
    mastered,
    retention: calculateRetention(reviewedCount, progressedCount),
    sessions: calculateSessions(reviewDates),
    leitnerBoxes: calculateLeitnerBoxes(boxCounts),
    weeklyActivity: calculateWeeklyActivity(reviewDates),
  };
}
