import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import { DifficultyButtons } from "./DifficultyButtons";
import { ShowAnswerButton } from "./ShowAnswerButton";
import type { Word, ReviewMode } from "./types";

export type ReviewPhase = "recall" | "revealed";

export type Difficulty = "hard" | "medium" | "easy";

interface ReviewCardProps {
  word: Word;
  phase: ReviewPhase;
  mode: ReviewMode;
  onReveal: () => void;
  onDifficulty: (difficulty: Difficulty) => void;
  isPending?: boolean;
}

function WordHeading({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <h2 className="text-3xl font-bold">{text}</h2>
      <button type="button" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer" aria-label="Pronounce word">
        <Volume2 className="w-5 h-5" />
      </button>
    </div>
  );
}

function MeaningBlock({ text }: { text: string }) {
  return (
    <div className="bg-accent/50 rounded-xl p-4 text-center">
      <p className="text-xs text-muted-foreground font-medium mb-1">Meaning</p>
      <p className="font-semibold whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function ExampleBlock({ text }: { text: string }) {
  return (
    <div className="bg-accent/50 rounded-xl p-4 text-center">
      <p className="text-xs text-muted-foreground font-medium mb-1">Example</p>
      <p className="italic whitespace-pre-wrap">{text}</p>
    </div>
  );
}

export function ReviewCard({ word, phase, mode, onReveal, onDifficulty, isPending = false }: ReviewCardProps) {
  const isNormal = mode === "normal";
  const promptNode = isNormal ? <WordHeading text={word.word} /> : <MeaningBlock text={word.meaning} />;
  const revealNode = isNormal ? <MeaningBlock text={word.meaning} /> : <WordHeading text={word.word} />;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={word.id + phase + mode}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full bg-card rounded-3xl border border-border p-8 shadow-lg"
      >
        <div className="text-center space-y-4">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
            {isNormal ? "Recall the meaning" : "Recall the word"}
          </p>
          {promptNode}

          {phase === "recall" ? (
            <ShowAnswerButton onClick={onReveal} />
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {revealNode}
              {word.exampleSentence && <ExampleBlock text={word.exampleSentence} />}
              <DifficultyButtons onSelect={onDifficulty} isPending={isPending} />
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
