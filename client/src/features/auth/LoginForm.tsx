import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, type LoginFormValues } from "./login-schema";
import { useLogin } from "./useLogin";
import { usePasswordVisibility } from "./usePasswordVisibility";
import AuthField from "./AuthField";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const { serverError, clearServerError, submit } = useLogin();
  const password = usePasswordVisibility();
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema), shouldFocusError: true });

  const onSubmit = (data: LoginFormValues) => submit(data, rememberMe);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <AuthField
        id="email"
        label="Email"
        icon={<Mail className="w-4 h-4" />}
        type="email"
        placeholder="you@example.com"
        aria-invalid={!!errors.email}
        error={errors.email?.message}
        {...register("email", { onChange: clearServerError })}
      />

      <AuthField
        id="password"
        label="Password"
        icon={<Lock className="w-4 h-4" />}
        type={password.visible ? "text" : "password"}
        placeholder="••••••••"
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

      {/* Remember me */}
      <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-4 h-4 rounded border-border accent-blue-500 cursor-pointer"
        />
        <span className="text-sm text-muted-foreground">Remember me</span>
      </label>

      {serverError && (
        <p className="text-destructive text-sm">{serverError}</p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full h-12 rounded-xl text-base font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/30 border-0"
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
      </Button>
    </form>
  );
}
