import { ArrowLeftRight } from "lucide-react";
import type { ReviewMode } from "./types";

interface ReviewModeToggleProps {
  mode: ReviewMode;
  onChange: (mode: ReviewMode) => void;
}

const toggle = (mode: ReviewMode): ReviewMode => (mode === "normal" ? "reverse" : "normal");

export function ReviewModeToggle({ mode, onChange }: ReviewModeToggleProps) {
  return (
    <div className="flex items-center w-full bg-card border border-border rounded-xl p-1 mb-4 gap-1">
      <button
        type="button"
        onClick={() => onChange("normal")}
        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
          mode === "normal"
            ? "bg-blue-500 text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Word → Meaning
      </button>

      <button
        type="button"
        onClick={() => onChange(toggle(mode))}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-card transition-all duration-200 shrink-0"
        aria-label="Switch mode"
      >
        <ArrowLeftRight className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onChange("reverse")}
        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
          mode === "reverse"
            ? "bg-blue-500 text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Meaning → Word
      </button>
    </div>
  );
}
