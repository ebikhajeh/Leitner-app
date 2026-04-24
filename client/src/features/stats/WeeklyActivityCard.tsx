import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function WeeklyActivityCardSkeleton() {
  return <Skeleton className="h-[164px] rounded-2xl" />;
}

export function WeeklyActivityCard({
  weeklyActivity,
}: {
  weeklyActivity: [number, number, number, number, number, number, number];
}) {
  const maxCount = Math.max(...weeklyActivity, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card rounded-2xl border border-border p-5 space-y-3"
    >
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Weekly Activity
      </h2>
      <div className="flex items-end gap-2 h-24">
        {weeklyActivity.map((count, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${(count / maxCount) * 100}%` }}
            transition={{ delay: 0.5 + i * 0.06, duration: 0.4 }}
            className="flex-1 min-h-[4px] bg-foreground/20 rounded-lg relative overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 right-0 bg-foreground rounded-lg h-full" />
          </motion.div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        {DAY_LABELS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </motion.div>
  );
}
