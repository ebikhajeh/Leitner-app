import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeitnerBox } from "./types";

const BOX_LABELS: Record<number, string> = {
  1: "New",
  2: "Learning",
  3: "Familiar",
  4: "Confident",
  5: "Mastered",
};

const BOX_COLORS: Record<number, string> = {
  1: "bg-slate-400",
  2: "bg-blue-400",
  3: "bg-cyan-500",
  4: "bg-green-500",
  5: "bg-amber-400",
};

export function LeitnerBoxesCardSkeleton() {
  return <Skeleton className="h-[220px] rounded-2xl" />;
}

export function LeitnerBoxesCard({ leitnerBoxes }: { leitnerBoxes: LeitnerBox[] }) {
  const maxCount = Math.max(...leitnerBoxes.map((b) => b.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl border border-border p-5 space-y-4"
    >
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Leitner Boxes
      </h2>
      <div className="space-y-3">
        {leitnerBoxes.map(({ box, count }) => (
          <div key={box} className="flex items-center gap-3">
            <div className="w-20 shrink-0">
              <p className="text-xs font-bold text-muted-foreground">Box {box}</p>
              <p className="text-[10px] text-muted-foreground/60 leading-tight">{BOX_LABELS[box]}</p>
            </div>
            <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(count / maxCount) * 100}%` }}
                transition={{ delay: 0.3 + box * 0.08, duration: 0.5 }}
                className={`h-full ${BOX_COLORS[box]} rounded-lg flex items-center justify-end pr-2`}
              >
                {count > 0 && (
                  <span className="text-[10px] font-bold text-white">{count}</span>
                )}
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
