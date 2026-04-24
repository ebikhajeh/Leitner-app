import { useRef } from "react";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { useGenerateWord } from "@/hooks/useGenerateWord";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { addWordSchema, AddWordFormValues } from "@/features/add-word/types";
import { AiAssistantPanel } from "@/features/add-word/AiAssistantPanel";
import { AddWordForm } from "@/features/add-word/AddWordForm";

export default function AddWordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(true);

  const wordInputRef = useRef<HTMLInputElement>(null);

  const methods = useForm<AddWordFormValues>({ resolver: zodResolver(addWordSchema) });
  const { reset, watch, setValue } = methods;

  const { targetLanguage, setTargetLanguage, isGenerating, aiError, hasGenerated, generate, resetGenerated } =
    useGenerateWord();

  const wordValue = watch("word");
  const meaningValue = watch("meaning");
  const canSubmit = !!wordValue?.trim() && !!meaningValue?.trim();
  const canGenerate = !!wordValue?.trim() && !isGenerating;

  const handleGenerate = () => {
    if (!wordValue?.trim()) return;
    generate(wordValue, (result) => {
      setValue("meaning", result.meaning, { shouldValidate: true });
      setValue("exampleSentence", result.exampleSentence, { shouldValidate: true });
    });
  };

  const queryClient = useQueryClient();

  const { mutate: saveWord, isPending } = useMutation({
    mutationFn: (data: AddWordFormValues) => api.post("/words", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["words", "due"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      reset();
      resetGenerated();
      wordInputRef.current?.focus();
      toast.success("Word saved successfully!", {
        style: { background: "white", color: "#16a34a" },
        classNames: { icon: "text-green-600" },
      });
    },
    onError: (error: unknown) => {
      setServerError(getApiErrorMessage(error, "Something went wrong. Please try again."));
    },
  });

  const onSubmit = (data: AddWordFormValues) => {
    setServerError(null);
    saveWord(data);
  };

  return (
    <FormProvider {...methods}>
      <div className="px-5 pt-6 pb-28 max-w-lg mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold">Add New Word</h1>
          <p className="text-sm text-muted-foreground">Add vocabulary manually or with AI</p>
        </div>

        <AiAssistantPanel
          open={aiOpen}
          onOpenChange={setAiOpen}
          targetLanguage={targetLanguage}
          onTargetLanguageChange={setTargetLanguage}
          canGenerate={canGenerate}
          isGenerating={isGenerating}
          aiError={aiError}
          onGenerate={handleGenerate}
        />

        <AddWordForm
          onSubmit={onSubmit}
          wordInputRef={wordInputRef}
          isGenerating={isGenerating}
          hasGenerated={hasGenerated}
          isPending={isPending}
          canSubmit={canSubmit}
          serverError={serverError}
          onClearServerError={() => setServerError(null)}
        />

        <p className="text-xs text-center text-muted-foreground">
          AI helps you create cards faster. Fields stay editable.
        </p>
      </div>
    </FormProvider>
  );
}
