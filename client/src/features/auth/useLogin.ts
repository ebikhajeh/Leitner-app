import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "@/lib/auth-client";
import type { LoginFormValues } from "./login-schema";

export function useLogin() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const clearServerError = () => setServerError(null);

  const submit = async (data: LoginFormValues, rememberMe: boolean) => {
    setServerError(null);
    await signIn.email(
      { ...data, rememberMe },
      {
        onSuccess: () => navigate("/"),
        onError: (ctx) => setServerError(ctx.error.message),
      }
    );
  };

  return { serverError, clearServerError, submit };
}
