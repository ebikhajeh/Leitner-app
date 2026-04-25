import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { signUpSchema, type SignUpFormValues } from "./signup-schema";
import { useSignUp } from "./useSignUp";
import { usePasswordVisibility } from "./usePasswordVisibility";
import AuthField from "./AuthField";
import { Button } from "@/components/ui/button";

export default function SignUpForm() {
  const { serverError, clearServerError, submit } = useSignUp();
  const password = usePasswordVisibility();
  const confirmPassword = usePasswordVisibility();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({ resolver: zodResolver(signUpSchema), shouldFocusError: true });

  const onSubmit = (data: SignUpFormValues) => submit(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <AuthField
        id="name"
        label="Name"
        icon={<User className="w-4 h-4" />}
        type="text"
        placeholder="Your name"
        aria-invalid={!!errors.name}
        error={errors.name?.message}
        {...register("name", { onChange: clearServerError })}
      />

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
        placeholder="Min. 8 characters"
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
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
      </Button>
    </form>
  );
}
