import { db } from "./db";

export const SETTINGS_DEFAULTS = {
  dailyReviewLimit: 20,
  dailyDueCards: 10 as number | null,
  autoSave: false,
};

export async function getSettings(userId: string) {
  const settings = await db.userSettings.findUnique({ where: { userId } });
  return settings ?? { id: null, userId, ...SETTINGS_DEFAULTS };
}

export async function upsertSettings(
  userId: string,
  data: { dailyReviewLimit?: number; dailyDueCards?: number | null; autoSave?: boolean }
) {
  return db.userSettings.upsert({
    where: { userId },
    update: data,
    create: { userId, ...SETTINGS_DEFAULTS, ...data },
  });
}

export async function resetSettings(userId: string) {
  return db.userSettings.upsert({
    where: { userId },
    update: SETTINGS_DEFAULTS,
    create: { userId, ...SETTINGS_DEFAULTS },
  });
}
