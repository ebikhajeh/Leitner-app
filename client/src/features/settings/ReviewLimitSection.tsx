import { BookOpen } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const REVIEW_PRESETS = [10, 20, 30, 50];

interface Props {
  reviewLimit: number;
  onReviewLimitChange: (value: number) => void;
}

export function ReviewLimitSection({ reviewLimit, onReviewLimitChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 text-accent-foreground" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold">Daily Review Limit</h2>
          <p className="text-xs text-muted-foreground">
            How many cards you want to review each day.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary leading-none">{reviewLimit}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">cards</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {REVIEW_PRESETS.map((n) => (
          <button
            key={n}
            onClick={() => onReviewLimitChange(n)}
            className={`h-10 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              reviewLimit === n
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-foreground hover:bg-muted/70"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
          <span>5</span>
          <span>Custom</span>
          <span>100</span>
        </div>
        <Slider
          value={[reviewLimit]}
          onValueChange={(v) => {
            const val = Array.isArray(v) ? v[0] : v;
            if (typeof val === "number") onReviewLimitChange(val);
          }}
          min={5}
          max={100}
          step={1}
        />
      </div>

      <div className="flex items-center gap-3">
        <Label htmlFor="custom-review" className="text-xs text-muted-foreground font-medium">
          Custom
        </Label>
        <Input
          id="custom-review"
          type="number"
          min={1}
          max={500}
          value={reviewLimit}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v) && v > 0) onReviewLimitChange(Math.min(v, 500));
          }}
          className="h-9 w-24 text-sm"
        />
        <span className="text-xs text-muted-foreground">cards/day</span>
      </div>
    </div>
  );
}
