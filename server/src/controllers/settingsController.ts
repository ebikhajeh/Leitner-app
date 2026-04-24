import type { Request, Response } from "express";
import { getSettings, upsertSettings, resetSettings } from "../lib/settingsService";

export async function getSettingsHandler(_req: Request, res: Response) {
  const settings = await getSettings(res.locals.user.id);
  res.json({ settings });
}

export async function updateSettingsHandler(req: Request, res: Response) {
  const settings = await upsertSettings(res.locals.user.id, req.body);
  res.json({ settings });
}

export async function resetSettingsHandler(_req: Request, res: Response) {
  const settings = await resetSettings(res.locals.user.id);
  res.json({ settings });
}
