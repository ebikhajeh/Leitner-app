import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, BookOpen, Clock, RotateCcw, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const REVIEW_PRESETS = [10, 20, 30, 50];
const DUE_PRESETS: (number | "all")[] = [5, 10, 15, "all"];

const DEFAULTS = {
  reviewLimit: 20,
  dueLimit: 10 as number | "all",
  autoSave: false,
};

const SettingsScreen = () => {
  const [reviewLimit, setReviewLimit] = useState<number>(DEFAULTS.reviewLimit);
  const [dueLimit, setDueLimit] = useState<number | "all">(DEFAULTS.dueLimit);
  const [autoSave, setAutoSave] = useState<boolean>(DEFAULTS.autoSave);

  const handleSave = () => {
    toast.success("Settings saved", {
      description: `${reviewLimit} cards/day · ${dueLimit === "all" ? "All" : dueLimit} due cards`,
    });
  };

  const handleReset = () => {
    setReviewLimit(DEFAULTS.reviewLimit);
    setDueLimit(DEFAULTS.dueLimit);
    setAutoSave(DEFAULTS.autoSave);
    toast("Reset to defaults");
  };

  const handleReviewSlider = (v: number[]) => setReviewLimit(v[0]);

  return (
    <div className="px-5 pt-6 pb-28 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Customize your daily learning pace.</p>
        </div>
      </motion.div>

      {/* Daily Review Limit */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-5"
      >
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

        {/* Presets */}
        <div className="grid grid-cols-4 gap-2">
          {REVIEW_PRESETS.map((n) => {
            const active = reviewLimit === n;
            return (
              <button
                key={n}
                onClick={() => setReviewLimit(n)}
                className={`h-10 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-foreground hover:bg-muted/70"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
            <span>5</span>
            <span>Custom</span>
            <span>100</span>
          </div>
          <Slider
            value={[reviewLimit]}
            onValueChange={handleReviewSlider}
            min={5}
            max={100}
            step={1}
          />
        </div>

        {/* Custom input */}
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
              if (!isNaN(v) && v > 0) setReviewLimit(Math.min(v, 500));
            }}
            className="h-9 w-24 text-sm"
          />
          <span className="text-xs text-muted-foreground">cards/day</span>
        </div>
      </motion.section>

      {/* Daily Due Cards Limit */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-5"
      >
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
          {DUE_PRESETS.map((n) => {
            const active = dueLimit === n;
            const label = n === "all" ? "All" : String(n);
            return (
              <button
                key={String(n)}
                onClick={() => setDueLimit(n)}
                className={`h-10 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-streak text-white shadow-sm"
                    : "bg-muted text-foreground hover:bg-muted/70"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5">
          <Sparkles className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-[11px] text-muted-foreground">
            Tip: smaller batches feel lighter and improve consistency.
          </p>
        </div>
      </motion.section>

      {/* Preferences */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card rounded-2xl p-5 border border-border shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="autosave" className="text-sm font-semibold">
              Auto-save changes
            </Label>
            <p className="text-xs text-muted-foreground">
              Save instantly when you adjust a setting.
            </p>
          </div>
          <Switch id="autosave" checked={autoSave} onCheckedChange={setAutoSave} />
        </div>
      </motion.section>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3"
      >
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex-1 h-12 rounded-2xl font-semibold"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button
          onClick={handleSave}
          className="flex-1 h-12 rounded-2xl font-semibold"
          disabled={autoSave}
        >
          <Save className="w-4 h-4 mr-2" />
          {autoSave ? "Auto-saving" : "Save"}
        </Button>
      </motion.div>
    </div>
  );
};

export default SettingsScreen;
