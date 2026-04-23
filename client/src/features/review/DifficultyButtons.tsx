import type { Difficulty } from "./ReviewCard";

const BUTTONS: { label: string; value: Difficulty; className: string }[] = [
  { label: "Hard",   value: "hard",   className: "bg-destructive text-destructive-foreground" },
  { label: "Medium", value: "medium", className: "bg-amber-400 text-amber-950" },
  { label: "Easy",   value: "easy",   className: "bg-green-500 text-white" },
];

interface DifficultyButtonsProps {
  onSelect: (difficulty: Difficulty) => void;
  isPending?: boolean;
}

export function DifficultyButtons({ onSelect, isPending = false }: DifficultyButtonsProps) {
  return (
    <div className="pt-2 space-y-2">
      <p className="text-xs text-muted-foreground font-medium">How well did you know this?</p>
      <div className="flex gap-2">
        {BUTTONS.map(({ label, value, className }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            disabled={isPending}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${className}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
