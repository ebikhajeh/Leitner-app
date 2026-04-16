import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "../lib/auth-client";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

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
    try {
      await signIn.email(data, {
        onSuccess: () => navigate("/"),
        onError: (ctx) => setServerError(ctx.error.message),
      });
    } finally {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6">Sign in</h1>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Email
            <input
              type="email"
              {...register("email", { onChange: () => setServerError(null) })}
              placeholder="you@example.com"
              className={`px-3 py-2 text-sm border rounded-md outline-none ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <span className="text-red-600 text-xs">{errors.email.message}</span>
            )}
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Password
            <input
              type="password"
              {...register("password", { onChange: () => setServerError(null) })}
              placeholder="••••••••"
              className={`px-3 py-2 text-sm border rounded-md outline-none ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <span className="text-red-600 text-xs">{errors.password.message}</span>
            )}
          </label>
          {serverError && <p className="text-red-600 text-sm">{serverError}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 py-2 text-sm font-semibold bg-gray-900 text-white rounded-md cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
