import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import type { ResetPasswordFormValues } from "./reset-password-schema";

export function useResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [serverError, setServerError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const clearServerError = () => setServerError(null);

  const submit = async (data: ResetPasswordFormValues) => {
    if (!token) return;
    setServerError(null);
    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });
    if (error) {
      setServerError(
        error.message ?? "This link is invalid or has expired. Please request a new one."
      );
    } else {
      setSucceeded(true);
    }
  };

  return { serverError, clearServerError, submit, succeeded, token };
}
