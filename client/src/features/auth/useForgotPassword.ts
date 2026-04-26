import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { ForgotPasswordFormValues } from "./forgot-password-schema";

export function useForgotPassword() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const clearServerError = () => setServerError(null);

  const submit = async (data: ForgotPasswordFormValues) => {
    setServerError(null);
    const { error } = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setServerError(error.message ?? "Something went wrong. Please try again.");
    } else {
      setSucceeded(true);
    }
  };

  return { serverError, clearServerError, submit, succeeded };
}
