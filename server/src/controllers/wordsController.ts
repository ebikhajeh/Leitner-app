import type { Request, Response } from "express";
import { getWordsByUser, getDueWords, createWord, reviewWord } from "../lib/wordService";

export async function listDueWords(req: Request, res: Response) {
  const words = await getDueWords(res.locals.user.id);
  res.json({ words });
}

export async function listWords(req: Request, res: Response) {
  const words = await getWordsByUser(res.locals.user.id);
  res.json({ words });
}

export async function submitReview(req: Request, res: Response) {
  const updated = await reviewWord(String(req.params.id), res.locals.user.id, req.body.difficulty);
  if (!updated) { res.status(404).json({ message: "Word not found" }); return; }
  res.json({ word: updated });
}

export async function addWord(req: Request, res: Response) {
  const { word, meaning, exampleSentence } = req.body;
  const newWord = await createWord({ word, meaning, exampleSentence, userId: res.locals.user.id });
  res.status(201).json({ word: newWord });
}
