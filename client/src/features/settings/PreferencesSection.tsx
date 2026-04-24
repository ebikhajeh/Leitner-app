import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Props {
  autoSave: boolean;
  onAutoSaveToggle: (checked: boolean) => void;
}

export function PreferencesSection({ autoSave, onAutoSaveToggle }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor="autosave" className="text-sm font-semibold">
          Auto-save changes
        </Label>
        <p className="text-xs text-muted-foreground">
          Save instantly when you adjust a setting.
        </p>
      </div>
      <Switch id="autosave" checked={autoSave} onCheckedChange={onAutoSaveToggle} />
    </div>
  );
}
