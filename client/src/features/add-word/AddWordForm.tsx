import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AddWordFormValues, inputClass, aiInputClass } from "./types";

export type AddWordFormProps = {
  onSubmit: (data: AddWordFormValues) => void;
  wordInputRef: React.RefObject<HTMLInputElement | null>;
  isGenerating: boolean;
  hasGenerated: boolean;
  isPending: boolean;
  canSubmit: boolean;
  serverError: string | null;
  onClearServerError: () => void;
};

export function AddWordForm({
  onSubmit,
  wordInputRef,
  isGenerating,
  hasGenerated,
  isPending,
  canSubmit,
  serverError,
  onClearServerError,
}: AddWordFormProps) {
  const { register, handleSubmit, formState: { errors } } = useFormContext<AddWordFormValues>();

  const { ref: wordRegisterRef, ...wordRegisterRest } = register("word", {
    onChange: onClearServerError,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-card rounded-2xl border border-border p-5 shadow-sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Word
          </label>
          <input
            placeholder="e.g. abandon"
            className={inputClass}
            aria-invalid={!!errors.word}
            autoFocus
            ref={(el) => {
              wordRegisterRef(el);
              (wordInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
            }}
            {...wordRegisterRest}
          />
          {errors.word && (
            <p className="text-destructive text-xs">{errors.word.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Meaning
          </label>
          {isGenerating ? (
            <Skeleton className="h-20 w-full rounded-xl" />
          ) : (
            <textarea
              placeholder={"e.g. to leave behind\nترک کردن / رها کردن"}
              className={`${hasGenerated ? aiInputClass : inputClass} resize-none h-20`}
              aria-invalid={!!errors.meaning}
              {...register("meaning", { onChange: onClearServerError })}
            />
          )}
          {errors.meaning && (
            <p className="text-destructive text-xs">{errors.meaning.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Example Sentence{" "}
            <span className="normal-case font-normal tracking-normal">(optional)</span>
          </label>
          {isGenerating ? (
            <Skeleton className="h-24 w-full rounded-xl" />
          ) : (
            <textarea
              placeholder={"e.g. He abandoned the project.\nShe abandoned the plan."}
              className={`${hasGenerated ? aiInputClass : inputClass} resize-none h-24`}
              {...register("exampleSentence")}
            />
          )}
        </div>

        {serverError && <p className="text-destructive text-sm">{serverError}</p>}

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-xl h-14 text-base font-semibold bg-blue-500 hover:bg-blue-600"
          disabled={!canSubmit || isPending}
        >
          {isPending ? "Saving…" : "Save Word"}
        </Button>
      </form>
    </motion.div>
  );
}
