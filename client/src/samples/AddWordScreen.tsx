import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";

const AddWordScreen = () => {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!word.trim() || !meaning.trim()) return;
    setSaved(true);
    toast.success("Word saved successfully!");
    setTimeout(() => {
      setWord("");
      setMeaning("");
      setExample("");
      setSaved(false);
    }, 1500);
  };

  const inputClass =
    "w-full bg-card border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";

  return (
    <div className="px-5 pt-6 pb-28 max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold">Add New Word</h1>
        <p className="text-sm text-muted-foreground">Add vocabulary to your collection</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-5 space-y-4"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Word</label>
          <input value={word} onChange={(e) => setWord(e.target.value)} placeholder="e.g. abandon" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meaning</label>
          <input value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="e.g. to leave behind" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Example Sentence</label>
          <textarea
            value={example}
            onChange={(e) => setExample(e.target.value)}
            placeholder="e.g. He abandoned the project."
            className={`${inputClass} resize-none h-20`}
          />
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
    </div>
  );
};

export default AddWordScreen;
