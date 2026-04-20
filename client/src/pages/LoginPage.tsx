import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "../lib/auth-client";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

const inputClass =
  "w-full bg-card border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";

export default function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), shouldFocusError: true });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    await signIn.email(data, {
      onSuccess: () => navigate("/"),
      onError: (ctx) => setServerError(ctx.error.message),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your credentials to continue.</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={inputClass}
                aria-invalid={!!errors.email}
                {...register("email", { onChange: () => setServerError(null) })}
              />
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={inputClass}
                aria-invalid={!!errors.password}
                {...register("password", { onChange: () => setServerError(null) })}
              />
              {errors.password && (
                <p className="text-destructive text-xs">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <p className="text-destructive text-sm">{serverError}</p>
            )}

            <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
