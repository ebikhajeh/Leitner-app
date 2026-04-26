import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordFormValues } from "./reset-password-schema";
import { useResetPassword } from "./useResetPassword";
import { usePasswordVisibility } from "./usePasswordVisibility";
import AuthField from "./AuthField";
import { Button } from "@/components/ui/button";

export default function ResetPasswordForm() {
  const { serverError, clearServerError, submit, succeeded, token } = useResetPassword();
  const password = usePasswordVisibility();
  const confirmPassword = usePasswordVisibility();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    shouldFocusError: true,
  });

  if (!token) {
    return (
      <div className="text-center space-y-2 py-2">
        <p className="text-sm font-medium text-destructive">Invalid reset link</p>
        <p className="text-sm text-muted-foreground">
          This link is missing a reset token.{" "}
          <Link to="/forgot-password" className="text-foreground font-semibold hover:underline">
            Request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  if (succeeded) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <p className="font-semibold text-sm">Password updated</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your password has been changed.{" "}
            <Link to="/login" className="text-foreground font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <AuthField
        id="password"
        label="New Password"
        icon={<Lock className="w-4 h-4" />}
        type={password.visible ? "text" : "password"}
        placeholder="Min. 8 characters"
        autoComplete="new-password"
        aria-invalid={!!errors.password}
        error={errors.password?.message}
        rightSlot={
          <button
            type="button"
            onClick={password.toggle}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label={password.visible ? "Hide password" : "Show password"}
          >
            {password.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
        {...register("password", { onChange: clearServerError })}
      />

      <AuthField
        id="confirmPassword"
        label="Confirm Password"
        icon={<Lock className="w-4 h-4" />}
        type={confirmPassword.visible ? "text" : "password"}
        placeholder="••••••••"
        autoComplete="new-password"
        aria-invalid={!!errors.confirmPassword}
        error={errors.confirmPassword?.message}
        rightSlot={
          <button
            type="button"
            onClick={confirmPassword.toggle}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label={confirmPassword.visible ? "Hide password" : "Show password"}
          >
            {confirmPassword.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
        {...register("confirmPassword", { onChange: clearServerError })}
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
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset password"}
      </Button>
    </form>
  );
}
