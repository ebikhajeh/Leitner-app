import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DifficultyButtons } from "./DifficultyButtons";
import type { Word } from "./types";

export type ReviewPhase = "recall" | "revealed";

export type Difficulty = "hard" | "medium" | "easy";

interface ReviewCardProps {
  word: Word;
  phase: ReviewPhase;
  onReveal: () => void;
  onDifficulty: (difficulty: Difficulty) => void;
}

export function ReviewCard({ word, phase, onReveal, onDifficulty }: ReviewCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={word.id + phase}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full bg-card rounded-3xl border border-border p-8 shadow-lg"
      >
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-3xl font-bold">{word.word}</h2>
            <button className="text-muted-foreground hover:text-primary transition-colors" aria-label="Pronounce word">
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {phase === "recall" ? (
            <div className="pt-6">
              <Button onClick={onReveal} className="rounded-xl px-8" size="lg">
                Show Answer
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-2"
            >
              <div className="bg-accent/50 rounded-xl p-4 text-left">
                <p className="text-xs text-muted-foreground font-medium mb-1">Meaning</p>
                <p className="font-semibold whitespace-pre-wrap">{word.meaning}</p>
              </div>

              {word.exampleSentence && (
                <div className="bg-accent/50 rounded-xl p-4 text-left">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Example</p>
                  <p className="italic whitespace-pre-wrap">{word.exampleSentence}</p>
                </div>
              )}

              <DifficultyButtons onSelect={onDifficulty} />
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
