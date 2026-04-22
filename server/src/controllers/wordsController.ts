import type { Request, Response } from "express";
import { getWordsByUser, createWord } from "../lib/wordService";

export async function listWords(req: Request, res: Response) {
  const words = await getWordsByUser(res.locals.user.id);
  res.json({ words });
}

export async function addWord(req: Request, res: Response) {
  const { word, meaning, exampleSentence } = req.body;
  const newWord = await createWord({ word, meaning, exampleSentence, userId: res.locals.user.id });
  res.status(201).json({ word: newWord });
}
