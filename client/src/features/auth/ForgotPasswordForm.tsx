import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "./forgot-password-schema";
import { useForgotPassword } from "./useForgotPassword";
import AuthField from "./AuthField";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordForm() {
  const { serverError, clearServerError, submit, succeeded } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    shouldFocusError: true,
  });

  if (succeeded) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <p className="font-semibold text-sm">Check your inbox</p>
          <p className="text-sm text-muted-foreground mt-1">
            If an account exists for that email, we've sent a reset link. It expires in 1&nbsp;hour.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <AuthField
        id="email"
        label="Email"
        icon={<Mail className="w-4 h-4" />}
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        aria-invalid={!!errors.email}
        error={errors.email?.message}
        {...register("email", { onChange: clearServerError })}
      />

      {serverError && (
        <p className="text-destructive text-sm">{serverError}</p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full h-12 rounded-xl text-base font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/30 border-0"
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send reset link"}
      </Button>
    </form>
  );
}
