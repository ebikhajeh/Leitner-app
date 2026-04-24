import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSettings, useUpdateSettings, useResetSettings } from "@/hooks/useSettings";

const DEFAULT_SETTINGS = {
  reviewLimit: 20,
  dueLimit: 10 as number | "all",
  autoSave: false,
};

const successToast = (description?: string) =>
  toast.success("Settings saved", {
    description,
    style: { background: "white", color: "#16a34a" },
    classNames: { icon: "text-green-600" },
  });

export function useSettingsForm() {
  const { data: saved, isPending } = useSettings();
  const { mutate: save, isPending: isSaving } = useUpdateSettings();
  const { mutate: reset, isPending: isResetting } = useResetSettings();
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSave = (data: Parameters<typeof save>[0]) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => save(data), 400);
  };

  useEffect(() => () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); }, []);

  const [reviewLimit, setReviewLimit] = useState(DEFAULT_SETTINGS.reviewLimit);
  const [dueLimit, setDueLimit] = useState<number | "all">(DEFAULT_SETTINGS.dueLimit);
  const [autoSave, setAutoSave] = useState(DEFAULT_SETTINGS.autoSave);

  const hydrateSettings = (settings: NonNullable<typeof saved>) => {
    setReviewLimit(settings.dailyReviewLimit);
    setDueLimit(settings.dailyDueCards ?? "all");
    setAutoSave(settings.autoSave);
  };

  useEffect(() => {
    if (!saved) return;
    hydrateSettings(saved);
  }, [saved]);

  const buildPayload = () => ({
    dailyReviewLimit: reviewLimit,
    dailyDueCards: dueLimit === "all" ? null : dueLimit,
    autoSave,
  });

  const handleReviewLimitChange = (value: number) => {
    setReviewLimit(value);
    if (autoSave) debouncedSave({ dailyReviewLimit: value });
  };

  const handleDueLimitChange = (value: number | "all") => {
    setDueLimit(value);
    if (autoSave) debouncedSave({ dailyDueCards: value === "all" ? null : value });
  };

  const handleAutoSaveToggle = (checked: boolean) => {
    setAutoSave(checked);
    save(
      { ...buildPayload(), autoSave: checked },
      { onSuccess: () => successToast() }
    );
  };

  const handleSave = () => {
    save(buildPayload(), {
      onSuccess: () =>
        successToast(`${reviewLimit} cards/day · ${dueLimit === "all" ? "All" : dueLimit} due cards`),
    });
  };

  const handleReset = () => {
    reset(undefined, {
      onSuccess: (settings) => {
        hydrateSettings(settings);
        toast("Reset to defaults");
      },
    });
  };

  return {
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
  };
}
