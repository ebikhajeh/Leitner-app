import { motion } from "framer-motion";
import { BookOpen, Trophy, TrendingUp, CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import type { Stats } from "./types";

interface StatCard {
  label: string;
  value: string;
  icon: LucideIcon;
}

function buildCards(stats: Stats): StatCard[] {
  return [
    { label: "Total Words", value: stats.totalWords.toLocaleString(), icon: BookOpen },
    { label: "Mastered",    value: stats.mastered.toLocaleString(),   icon: Trophy },
    { label: "Retention",   value: `${stats.retention}%`,             icon: TrendingUp },
    { label: "Sessions",    value: stats.sessions.toLocaleString(),    icon: CalendarDays },
  ];
}

export function StatCardsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[88px] rounded-2xl" />
      ))}
    </div>
  );
}

export function StatCardsGrid({ stats }: { stats: Stats }) {
  const cards = buildCards(stats);
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl border border-border p-4 flex flex-col gap-2"
          >
            <Icon className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold leading-tight">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
