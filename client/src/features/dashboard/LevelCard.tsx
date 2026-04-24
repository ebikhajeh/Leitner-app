import { Trophy } from "lucide-react";
import type { DashboardStats } from "./types";

interface Props {
  level: DashboardStats["level"];
  xpInLevel: DashboardStats["xpInLevel"];
  xpForNextLevel: DashboardStats["xpForNextLevel"];
}

export function LevelCard({ level, xpInLevel, xpForNextLevel }: Props) {
  const pct = xpForNextLevel > 0 ? Math.min(Math.round((xpInLevel / xpForNextLevel) * 100), 100) : 0;

  return (
    <div className="bg-card rounded-2xl p-4 border border-border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-warning" />
          <span className="text-sm font-semibold">Level {level}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {xpInLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
