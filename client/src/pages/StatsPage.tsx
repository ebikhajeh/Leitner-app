import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useStats } from "@/hooks/useStats";
import { StatCardsGrid, StatCardsGridSkeleton } from "@/features/stats/StatCardsGrid";
import { LeitnerBoxesCard, LeitnerBoxesCardSkeleton } from "@/features/stats/LeitnerBoxesCard";
import { WeeklyActivityCard, WeeklyActivityCardSkeleton } from "@/features/stats/WeeklyActivityCard";

export default function StatsPage() {
  const { data: stats, isLoading, isError, refetch } = useStats();

  return (
    <div className="px-5 pt-6 pb-28 max-w-lg mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold">Progress & Stats</h1>
        <p className="text-sm text-muted-foreground">Track your learning journey</p>
      </motion.div>

      {isError ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-5 text-center space-y-3"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium">Couldn't load your stats</p>
            <p className="text-xs text-muted-foreground">Check your connection and try again.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="cursor-pointer">
            Retry
          </Button>
        </motion.div>
      ) : (
        <>
          {isLoading ? <StatCardsGridSkeleton /> : stats && <StatCardsGrid stats={stats} />}
          {isLoading ? <LeitnerBoxesCardSkeleton /> : stats && <LeitnerBoxesCard leitnerBoxes={stats.leitnerBoxes} />}
          {isLoading ? <WeeklyActivityCardSkeleton /> : stats && <WeeklyActivityCard weeklyActivity={stats.weeklyActivity} />}
        </>
      )}
    </div>
  );
}
