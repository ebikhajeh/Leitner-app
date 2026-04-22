import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";

export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }
    req.body = parsed.data;
    next();
  };
}
