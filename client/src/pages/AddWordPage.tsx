import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const schema = z.object({
  word: z.string().min(1, "Word is required"),
  meaning: z.string().min(1, "Meaning is required"),
  exampleSentence: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const inputClass =
  "w-full bg-card border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";

export default function AddWordPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const wordInputRef = useRef<HTMLInputElement>(null);
  const { ref: wordRegisterRef, ...wordRegisterRest } = register("word", { onChange: () => setServerError(null) });

  const wordValue = watch("word");
  const meaningValue = watch("meaning");
  const canSubmit = !!wordValue?.trim() && !!meaningValue?.trim();

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    const res = await fetch("/api/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      reset();
      wordInputRef.current?.focus();
      toast.success("Word saved successfully!", {
        style: { background: "white", color: "#16a34a" },
        classNames: { icon: "text-green-600" },
      });
    } else {
      const body = await res.json().catch(() => ({}));
      setServerError(body.message ?? "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-5 pb-28 max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold">Add New Word</h1>
        <p className="text-sm text-muted-foreground">Add vocabulary to your collection</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
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
              ref={(el) => { wordRegisterRef(el); (wordInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el; }}
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
            <input
              placeholder="e.g. to leave behind"
              className={inputClass}
              aria-invalid={!!errors.meaning}
              {...register("meaning", { onChange: () => setServerError(null) })}
            />
            {errors.meaning && (
              <p className="text-destructive text-xs">{errors.meaning.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Example Sentence{" "}
              <span className="normal-case font-normal tracking-normal">(optional)</span>
            </label>
            <textarea
              placeholder="e.g. He abandoned the project."
              className={`${inputClass} resize-none h-20`}
              {...register("exampleSentence")}
            />
          </div>

          {serverError && (
            <p className="text-destructive text-sm">{serverError}</p>
          )}

          <Button type="submit" size="lg" className="w-full rounded-xl h-14 text-base font-semibold bg-blue-500 hover:bg-blue-600" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Saving…" : "Save Word"}
          </Button>
        </form>
      </div>
    </div>
  );
}
