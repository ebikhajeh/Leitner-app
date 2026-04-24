import { Clock, Sparkles } from "lucide-react";

const DUE_PRESETS: (number | "all")[] = [5, 10, 15, "all"];

interface Props {
  dueLimit: number | "all";
  onDueLimitChange: (value: number | "all") => void;
}

export function DueCardsSection({ dueLimit, onDueLimitChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-streak/10 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4 text-streak" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold">Daily Due Cards</h2>
          <p className="text-xs text-muted-foreground">
            How many due cards appear in today's session.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-streak leading-none">
            {dueLimit === "all" ? "∞" : dueLimit}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
            {dueLimit === "all" ? "all" : "due"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {DUE_PRESETS.map((n) => (
          <button
            key={String(n)}
            onClick={() => onDueLimitChange(n)}
            className={`h-10 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              dueLimit === n
                ? "bg-streak text-white shadow-sm"
                : "bg-muted text-foreground hover:bg-muted/70"
            }`}
          >
            {n === "all" ? "All" : String(n)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5">
        <Sparkles className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <p className="text-[11px] text-muted-foreground">
          Tip: smaller batches feel lighter and improve consistency.
        </p>
      </div>
    </div>
  );
}
