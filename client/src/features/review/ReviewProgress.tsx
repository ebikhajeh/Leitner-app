interface ReviewProgressProps {
  current: number;
  total: number;
}

export function ReviewProgress({ current, total }: ReviewProgressProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-semibold text-muted-foreground">
        {current} / {total}
      </span>
      <div className="flex-1 mx-4 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
