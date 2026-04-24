import { motion } from "framer-motion";
import { Settings as SettingsIcon, RotateCcw, Save } from "lucide-react";
import type { ReactNode } from "react";

function AnimatedSettingsCard({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl p-5 border border-border shadow-sm"
    >
      {children}
    </motion.section>
  );
}
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import { ReviewLimitSection } from "@/features/settings/ReviewLimitSection";
import { DueCardsSection } from "@/features/settings/DueCardsSection";
import { PreferencesSection } from "@/features/settings/PreferencesSection";

export default function SettingsPage() {
  const {
    isPending,
    isSaving,
    isResetting,
    reviewLimit,
    dueLimit,
    autoSave,
    handleReviewLimitChange,
    handleDueLimitChange,
    handleAutoSaveToggle,
    handleSave,
    handleReset,
  } = useSettingsForm();

  if (isPending) {
    return (
      <div className="px-5 pt-6 pb-28 max-w-lg mx-auto space-y-6">
        <Skeleton className="h-14 w-48 rounded-2xl" />
        <Skeleton className="h-52 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-28 max-w-lg mx-auto space-y-6">
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

      <AnimatedSettingsCard delay={0.05}>
        <ReviewLimitSection
          reviewLimit={reviewLimit}
          onReviewLimitChange={handleReviewLimitChange}
        />
      </AnimatedSettingsCard>

      <AnimatedSettingsCard delay={0.1}>
        <DueCardsSection dueLimit={dueLimit} onDueLimitChange={handleDueLimitChange} />
      </AnimatedSettingsCard>

      <AnimatedSettingsCard delay={0.15}>
        <PreferencesSection autoSave={autoSave} onAutoSaveToggle={handleAutoSaveToggle} />
      </AnimatedSettingsCard>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3"
      >
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isResetting}
          className="flex-1 h-12 rounded-2xl font-semibold cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={autoSave || isSaving}
          className="flex-1 h-12 rounded-2xl font-semibold cursor-pointer"
        >
          <Save className="w-4 h-4 mr-2" />
          {autoSave ? "Auto-saving" : isSaving ? "Saving…" : "Save"}
        </Button>
      </motion.div>
    </div>
  );
}
