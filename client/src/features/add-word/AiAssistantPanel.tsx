import { motion } from "framer-motion";
import { Sparkles, Loader2, Wand2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES } from "@/config/languages";

export type AiAssistantPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetLanguage: string;
  onTargetLanguageChange: (lang: string) => void;
  canGenerate: boolean;
  isGenerating: boolean;
  aiError: string | null;
  onGenerate: () => void;
};

export function AiAssistantPanel({
  open,
  onOpenChange,
  targetLanguage,
  onTargetLanguageChange,
  canGenerate,
  isGenerating,
  aiError,
  onGenerate,
}: AiAssistantPanelProps) {
  const selectedLang = LANGUAGES.find((l) => l.label === targetLanguage) ?? LANGUAGES[0];

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-500/8 to-violet-500/8"
      >
        <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 blur-3xl bg-blue-500" />

        <CollapsibleTrigger className="w-full p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-500 to-violet-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-1.5">
                AI Word Assistant
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-500 font-semibold">
                  BETA
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Generate meaning and examples instantly</p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-5 pb-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Target Language
              </label>
              <Select value={targetLanguage} onValueChange={(v) => v && onTargetLanguageChange(v)}>
                <SelectTrigger className="h-12 rounded-xl bg-card border-border">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <span className="text-lg leading-none">{selectedLang.flag}</span>
                      <span className="text-sm font-medium">{selectedLang.label}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.label} value={l.label}>
                      <span className="flex items-center gap-2">
                        <span className="text-lg leading-none">{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              onClick={onGenerate}
              disabled={!canGenerate}
              className="w-full rounded-xl h-12 text-white border-0 shadow-md hover:opacity-90 transition-opacity bg-gradient-to-r from-blue-500 to-violet-500 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI is thinking...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate with AI ✨
                </>
              )}
            </Button>

            {aiError && <p className="text-destructive text-xs text-center">{aiError}</p>}

            <p className="text-xs text-center text-muted-foreground">
              Enter a word above, then let AI prepare the rest
            </p>
          </div>
        </CollapsibleContent>
      </motion.div>
    </Collapsible>
  );
}
