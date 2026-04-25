import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props extends React.ComponentProps<"input"> {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string;
  rightSlot?: React.ReactNode;
}

export default function AuthField({ id, label, icon, error, rightSlot, className, ...inputProps }: Props) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {icon}
        </span>
        <Input
          id={id}
          className={cn("pl-10 h-12 rounded-xl", rightSlot && "pr-10", className)}
          {...inputProps}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
      {error && (
        <p className="text-destructive text-xs">{error}</p>
      )}
    </div>
  );
}
