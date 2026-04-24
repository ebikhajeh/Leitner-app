import { db } from "./db";
import { XP_PER_REVIEW, XP_PER_LEVEL, WEEKLY_GOAL } from "./dashboardConfig";

const MS_PER_DAY = 86_400_000;
const WEEK_DAYS = 7;

function utcDayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function utcDayNumber(d: Date): number {
  return utcDayStart(d).getTime() / MS_PER_DAY;
}

function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const uniqueDays = [...new Set(dates.map(utcDayNumber))].sort((a, b) => b - a);
  const today = utcDayNumber(new Date());

  if (uniqueDays[0] < today - 1) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    if (uniqueDays[i - 1] - uniqueDays[i] === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export async function getDashboardStats(userId: string) {
  const now = new Date();
  const todayStart = utcDayStart(now);
  const weekAgo = new Date(todayStart.getTime() - WEEK_DAYS * MS_PER_DAY);

  const [words, dueCount] = await Promise.all([
    db.word.findMany({
      where: { userId },
      select: { reviewCount: true, lastReviewedAt: true },
    }),
    db.word.count({
      where: { userId, nextReviewAt: { lte: now } },
    }),
  ]);

  const xp = words.reduce((sum, w) => sum + w.reviewCount * XP_PER_REVIEW, 0);
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp % XP_PER_LEVEL;

  const reviewDates = words.flatMap(w => (w.lastReviewedAt ? [w.lastReviewedAt] : []));
  const streak = computeStreak(reviewDates);

  // Unique cards whose last review fell on today (UTC). Each word appears once
  // in `words` regardless of how many times it was reviewed, so this is a
  // distinct-card count, not a total-actions count.
  const reviewedToday = words.filter(
    w => w.lastReviewedAt && w.lastReviewedAt >= todayStart
  ).length;

  const weeklyReviews = words.filter(
    w => w.lastReviewedAt && w.lastReviewedAt >= weekAgo
  ).length;

  return {
    streak,
    xp,
    level,
    xpInLevel,
    xpForNextLevel: XP_PER_LEVEL,
    reviewedToday,
    dueCount,
    weeklyReviews,
    weeklyGoal: WEEKLY_GOAL,
  };
}
