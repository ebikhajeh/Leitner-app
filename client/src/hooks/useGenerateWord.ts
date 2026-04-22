import { useState } from "react";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

type GenerateResult = { meaning: string; exampleSentence: string };

export function useGenerateWord() {
  const [targetLanguage, setTargetLanguage] = useState("Persian");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  async function generate(word: string, onSuccess: (result: GenerateResult) => void) {
    setIsGenerating(true);
    setAiError(null);
    try {
      const { data } = await api.post<GenerateResult>("/generate-word", {
        word: word.trim(),
        targetLanguage,
      });
      onSuccess(data);
      setHasGenerated(true);
    } catch (err) {
      setAiError(getApiErrorMessage(err, "AI generation failed. Please try again."));
    } finally {
      setIsGenerating(false);
    }
  }

  function resetGenerated() {
    setHasGenerated(false);
  }

  return { targetLanguage, setTargetLanguage, isGenerating, aiError, hasGenerated, generate, resetGenerated };
}
