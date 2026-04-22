import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { createWordSchema } from "../lib/wordSchemas";
import { listWords, addWord } from "../controllers/wordsController";

const router = Router();

router.get("/", requireAuth, listWords);
router.post("/", requireAuth, validate(createWordSchema), addWord);

export default router;
