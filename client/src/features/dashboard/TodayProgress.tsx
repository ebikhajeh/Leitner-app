import type { DashboardStats } from "./types";

interface Props {
  reviewedToday: DashboardStats["reviewedToday"];
  dueCount: DashboardStats["dueCount"];
  weeklyReviews: DashboardStats["weeklyReviews"];
  weeklyGoal: DashboardStats["weeklyGoal"];
}

export function TodayProgress({ reviewedToday, dueCount, weeklyReviews, weeklyGoal }: Props) {
  const weeklyPct = weeklyGoal > 0 ? Math.round(Math.min((weeklyReviews / weeklyGoal) * 100, 100)) : 0;

  return (
    <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Today's Progress
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-2xl font-bold">{reviewedToday}</p>
          <p className="text-xs text-muted-foreground">Words reviewed</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{dueCount}</p>
          <p className="text-xs text-muted-foreground">Cards due</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Weekly goal</span>
          <span>{weeklyPct}%</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all"
            style={{ width: `${weeklyPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
