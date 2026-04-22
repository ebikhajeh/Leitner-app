import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { db } from "../lib/db";
import { validateWord } from "../lib/validateWord";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  const { word, meaning, exampleSentence } = req.body;
  if (!word?.trim()) { res.status(400).json({ message: "Word is required" }); return; }
  if (!meaning?.trim()) { res.status(400).json({ message: "Meaning is required" }); return; }
  const wordCheck = validateWord(word);
  if (!wordCheck.ok) { res.status(400).json({ message: wordCheck.message }); return; }
  const newWord = await db.word.create({
    data: {
      word: word.trim(),
      meaning: meaning.trim(),
      exampleSentence: exampleSentence?.trim() || null,
      userId: res.locals.user.id,
    },
  });
  res.status(201).json({ word: newWord });
});

export default router;
