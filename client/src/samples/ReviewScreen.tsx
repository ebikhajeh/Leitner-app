import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sampleCards } from "@/data/cards";

type Phase = "recall" | "revealed";

const ReviewScreen = () => {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("recall");
  const card = sampleCards[index];

  const next = () => {
    setPhase("recall");
    setIndex((i) => Math.min(i + 1, sampleCards.length - 1));
  };
  const prev = () => {
    setPhase("recall");
    setIndex((i) => Math.max(i - 1, 0));
  };

  const handleDifficulty = (_d: string) => {
    next();
  };

  return (
    <div className="px-5 pt-6 pb-28 max-w-lg mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-muted-foreground">
          {index + 1} / {sampleCards.length}
        </span>
        <div className="flex-1 mx-4 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / sampleCards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id + phase}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full bg-card rounded-3xl border border-border p-8 shadow-lg"
          >
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-3xl font-bold">{card.word}</h2>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {phase === "recall" ? (
                <div className="pt-6">
                  <Button onClick={() => setPhase("revealed")} className="rounded-xl px-8" size="lg">
                    Show Answer
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-2"
                >
                  <div className="bg-accent/50 rounded-xl p-4">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Meaning</p>
                    <p className="font-semibold">{card.meaning}</p>
                  </div>
                  <div className="bg-accent/50 rounded-xl p-4">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Example</p>
                    <p className="italic">{card.example}</p>
                  </div>

                  {/* Difficulty */}
                  <div className="pt-2 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">How well did you know this?</p>
                    <div className="flex gap-2">
                      {[
                        { label: "Hard", color: "bg-destructive text-destructive-foreground" },
                        { label: "Medium", color: "bg-warning text-warning-foreground" },
                        { label: "Easy", color: "bg-success text-success-foreground" },
                      ].map(({ label, color }) => (
                        <button
                          key={label}
                          onClick={() => handleDifficulty(label)}
                          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-transform active:scale-95 ${color}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" size="icon" onClick={prev} disabled={index === 0} className="rounded-xl">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={next} disabled={index === sampleCards.length - 1} className="rounded-xl">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ReviewScreen;
