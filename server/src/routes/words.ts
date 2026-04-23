import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { createWordSchema, reviewWordSchema } from "../lib/wordSchemas";
import { listWords, listDueWords, addWord, submitReview } from "../controllers/wordsController";

const router = Router();

router.get("/", requireAuth, listWords);
router.get("/due", requireAuth, listDueWords);
router.post("/", requireAuth, validate(createWordSchema), addWord);
router.patch("/:id/review", requireAuth, validate(reviewWordSchema), submitReview);

export default router;
