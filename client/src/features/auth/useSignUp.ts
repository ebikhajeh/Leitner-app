import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import type { SignUpFormValues } from "./signup-schema";

export function useSignUp() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const clearServerError = () => setServerError(null);

  const submit = async (data: SignUpFormValues) => {
    setServerError(null);
    await authClient.signUp.email(
      { name: data.name, email: data.email, password: data.password },
      {
        onSuccess: () => navigate("/"),
        onError: (ctx) => setServerError(ctx.error.message),
      }
    );
  };

  return { serverError, clearServerError, submit };
}
