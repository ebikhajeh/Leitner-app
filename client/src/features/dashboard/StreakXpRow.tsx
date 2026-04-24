import { Flame, Zap } from "lucide-react";
import type { DashboardStats } from "./types";

interface Props {
  streak: DashboardStats["streak"];
  xp: DashboardStats["xp"];
}

export function StreakXpRow({ streak, xp }: Props) {
  return (
    <div className="flex gap-3">
      <div className="flex-1 bg-card rounded-2xl p-4 border border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-streak/10 flex items-center justify-center">
          <Flame className="w-5 h-5 text-streak" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Streak</p>
          <p className="text-lg font-bold">{streak} {streak === 1 ? "day" : "days"}</p>
        </div>
      </div>
      <div className="flex-1 bg-card rounded-2xl p-4 border border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-xp/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-xp" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">XP</p>
          <p className="text-lg font-bold">{xp.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
