import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Loader2, RefreshCw, ChevronDown, Wand2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";

type LanguageCode = "en" | "fa" | "es" | "fr" | "de" | "tr" | "ar";

const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fa", label: "Persian", flag: "🇮🇷" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "tr", label: "Turkish", flag: "🇹🇷" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
];

// Hardcoded fake AI dictionary for demo
const FAKE_AI_DB: Record<string, Partial<Record<LanguageCode, { meaning: string; example: string }>>> = {
  abandon: {
    en: { meaning: "to leave something behind permanently", example: "He abandoned the project after months of work." },
    fa: { meaning: "رها کردن / ترک کردن", example: "او پروژه را رها کرد." },
    es: { meaning: "abandonar / dejar atrás", example: "Él abandonó el proyecto." },
    fr: { meaning: "abandonner", example: "Il a abandonné le projet." },
    de: { meaning: "verlassen / aufgeben", example: "Er gab das Projekt auf." },
    tr: { meaning: "terk etmek", example: "Projeyi terk etti." },
    ar: { meaning: "يتخلى عن", example: "تخلى عن المشروع." },
  },
  improve: {
    en: { meaning: "to make or become better", example: "My English is improving every day." },
    fa: { meaning: "بهبود دادن / بهتر کردن", example: "انگلیسی من هر روز در حال بهبود است." },
    es: { meaning: "mejorar", example: "Mi inglés está mejorando cada día." },
    fr: { meaning: "améliorer", example: "Mon anglais s'améliore chaque jour." },
    de: { meaning: "verbessern", example: "Mein Englisch verbessert sich jeden Tag." },
    tr: { meaning: "geliştirmek", example: "İngilizcem her gün gelişiyor." },
    ar: { meaning: "يحسّن", example: "لغتي الإنجليزية تتحسن كل يوم." },
  },
  decision: {
    en: { meaning: "a conclusion reached after consideration", example: "I made an important decision yesterday." },
    fa: { meaning: "تصمیم / انتخاب", example: "دیروز یک تصمیم مهم گرفتم." },
    es: { meaning: "decisión", example: "Tomé una decisión importante ayer." },
    fr: { meaning: "décision", example: "J'ai pris une décision importante hier." },
    de: { meaning: "Entscheidung", example: "Ich habe gestern eine wichtige Entscheidung getroffen." },
    tr: { meaning: "karar", example: "Dün önemli bir karar verdim." },
    ar: { meaning: "قرار", example: "اتخذت قرارًا مهمًا أمس." },
  },
  create: {
    en: { meaning: "to bring something into existence", example: "She wants to create a new business." },
    fa: { meaning: "ایجاد کردن / ساختن", example: "او می‌خواهد یک کسب و کار جدید ایجاد کند." },
    es: { meaning: "crear", example: "Ella quiere crear un nuevo negocio." },
    fr: { meaning: "créer", example: "Elle veut créer une nouvelle entreprise." },
    de: { meaning: "erschaffen", example: "Sie möchte ein neues Unternehmen gründen." },
    tr: { meaning: "yaratmak", example: "Yeni bir iş kurmak istiyor." },
    ar: { meaning: "ينشئ", example: "تريد إنشاء عمل تجاري جديد." },
  },
};

const FALLBACK_EXAMPLES: Record<LanguageCode, (w: string) => { meaning: string; example: string }> = {
  en: (w) => ({ meaning: `the meaning of "${w}"`, example: `This is an example sentence using ${w}.` }),
  fa: (w) => ({ meaning: `معنی "${w}"`, example: `این یک جمله نمونه با ${w} است.` }),
  es: (w) => ({ meaning: `significado de "${w}"`, example: `Esta es una oración de ejemplo con ${w}.` }),
  fr: (w) => ({ meaning: `signification de "${w}"`, example: `Voici une phrase d'exemple avec ${w}.` }),
  de: (w) => ({ meaning: `Bedeutung von "${w}"`, example: `Dies ist ein Beispielsatz mit ${w}.` }),
  tr: (w) => ({ meaning: `"${w}" anlamı`, example: `Bu, ${w} ile örnek bir cümledir.` }),
  ar: (w) => ({ meaning: `معنى "${w}"`, example: `هذه جملة مثال تحتوي على ${w}.` }),
};

const getAIResult = (word: string, lang: LanguageCode) => {
  const key = word.trim().toLowerCase();
  return FAKE_AI_DB[key]?.[lang] ?? FALLBACK_EXAMPLES[lang](word.trim());
};

const AddWordScreen = () => {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [saved, setSaved] = useState(false);

  // AI Assistant state
  const [language, setLanguage] = useState<LanguageCode>("fa");
  const [aiOpen, setAiOpen] = useState(true);
  const [loadingMeaning, setLoadingMeaning] = useState(false);
  const [loadingExample, setLoadingExample] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const inputClass =
    "w-full bg-card border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-all";

  const handleSave = () => {
    if (!word.trim() || !meaning.trim()) return;
    setSaved(true);
    toast.success("Word saved successfully!");
    setTimeout(() => {
      setWord("");
      setMeaning("");
      setExample("");
      setSaved(false);
      setHasGenerated(false);
    }, 1500);
  };

  const simulateLoading = (ms = 900) => new Promise((r) => setTimeout(r, ms));

  const handleGenerateAll = async () => {
    if (!word.trim()) {
      toast.error("Please enter a word first");
      return;
    }
    setLoadingMeaning(true);
    setLoadingExample(true);
    await simulateLoading(1100);
    const result = getAIResult(word, language);
    setMeaning(result.meaning);
    setExample(result.example);
    setLoadingMeaning(false);
    setLoadingExample(false);
    setHasGenerated(true);
    toast.success("AI generated content ✨");
  };

  const handleGenerateMeaning = async () => {
    if (!word.trim()) return toast.error("Please enter a word first");
    setLoadingMeaning(true);
    await simulateLoading(800);
    setMeaning(getAIResult(word, language).meaning);
    setLoadingMeaning(false);
    setHasGenerated(true);
  };

  const handleGenerateExample = async () => {
    if (!word.trim()) return toast.error("Please enter a word first");
    setLoadingExample(true);
    await simulateLoading(800);
    setExample(getAIResult(word, language).example);
    setLoadingExample(false);
    setHasGenerated(true);
  };

  const selectedLang = LANGUAGES.find((l) => l.code === language)!;

  return (
    <div className="px-5 pt-6 pb-28 max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold">Add New Word</h1>
        <p className="text-sm text-muted-foreground">Add vocabulary manually or with AI assistance</p>
      </div>

      {/* AI Assistant Panel */}
      <Collapsible open={aiOpen} onOpenChange={setAiOpen}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden border border-xp/20"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--xp) / 0.08) 0%, hsl(var(--primary) / 0.08) 100%)",
          }}
        >
          {/* Decorative glow */}
          <div
            className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-30 blur-3xl"
            style={{ background: "hsl(var(--xp))" }}
          />

          <CollapsibleTrigger className="w-full p-5 flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3 text-left">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--xp)), hsl(var(--primary)))",
                }}
              >
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold text-sm flex items-center gap-1.5">
                  AI Word Assistant
                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-xp/15 text-xp font-semibold">
                    BETA
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generate meaning and sentence instantly
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                aiOpen ? "rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>

          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="px-5 pb-5 space-y-4">
              {/* Language Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Target Language
                </label>
                <Select value={language} onValueChange={(v) => setLanguage(v as LanguageCode)}>
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
                      <SelectItem key={l.code} value={l.code}>
                        <span className="flex items-center gap-2">
                          <span className="text-lg leading-none">{l.flag}</span>
                          <span>{l.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Generate button */}
              <Button
                onClick={handleGenerateAll}
                disabled={!word.trim() || loadingMeaning || loadingExample}
                className="w-full rounded-xl h-12 text-primary-foreground border-0 shadow-md hover:opacity-90 transition-opacity"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--xp)), hsl(var(--primary)))",
                }}
              >
                {loadingMeaning || loadingExample ? (
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

              <p className="text-xs text-center text-muted-foreground">
                Type one word and let AI prepare the rest
              </p>
            </div>
          </CollapsibleContent>
        </motion.div>
      </Collapsible>

      {/* Manual Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm"
      >
        {/* Word */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Word
          </label>
          <input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="e.g. abandon"
            className={inputClass}
          />
        </div>

        {/* Meaning */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Meaning
            </label>
            {hasGenerated && !loadingMeaning && meaning && (
              <button
                onClick={handleGenerateMeaning}
                className="text-xs font-semibold text-xp hover:text-xp/80 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
            )}
          </div>
          <AnimatePresence mode="wait">
            {loadingMeaning ? (
              <motion.div
                key="loading-m"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Skeleton className="h-12 w-full rounded-xl" />
              </motion.div>
            ) : (
              <motion.input
                key="input-m"
                initial={hasGenerated ? { opacity: 0, y: -4 } : false}
                animate={{ opacity: 1, y: 0 }}
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="e.g. to leave behind"
                className={`${inputClass} ${hasGenerated && meaning ? "border-xp/40 bg-xp/5" : ""}`}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Example */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Example Sentence
            </label>
            {hasGenerated && !loadingExample && example && (
              <button
                onClick={handleGenerateExample}
                className="text-xs font-semibold text-xp hover:text-xp/80 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
            )}
          </div>
          <AnimatePresence mode="wait">
            {loadingExample ? (
              <motion.div
                key="loading-e"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Skeleton className="h-20 w-full rounded-xl" />
              </motion.div>
            ) : (
              <motion.textarea
                key="input-e"
                initial={hasGenerated ? { opacity: 0, y: -4 } : false}
                animate={{ opacity: 1, y: 0 }}
                value={example}
                onChange={(e) => setExample(e.target.value)}
                placeholder="e.g. He abandoned the project."
                className={`${inputClass} resize-none h-20 ${
                  hasGenerated && example ? "border-xp/40 bg-xp/5" : ""
                }`}
              />
            )}
          </AnimatePresence>
        </div>

        <Button
          onClick={handleSave}
          disabled={!word.trim() || !meaning.trim()}
          className="w-full rounded-xl"
          size="lg"
        >
          {saved ? <Check className="w-4 h-4 mr-2" /> : null}
          {saved ? "Saved!" : "Save Word"}
        </Button>
      </motion.div>

      <p className="text-xs text-center text-muted-foreground">
        AI helps you create cards faster. Fields stay editable.
      </p>
    </div>
  );
};

export default AddWordScreen;
