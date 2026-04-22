import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import type { Word } from "./types";

interface ReviewCardProps {
  word: Word;
}

export function ReviewCard({ word }: ReviewCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={word.id}
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
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
