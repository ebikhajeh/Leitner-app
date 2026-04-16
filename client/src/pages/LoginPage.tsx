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
    } finally {
      // loading state is managed by isSubmitting
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Sign in</h1>
        <form onSubmit={handleSubmit(onSubmit)} style={styles.form} noValidate>
          <label style={styles.label}>
            Email
            <input
              type="email"
              {...register("email", { onChange: () => setServerError(null) })}
              style={{ ...styles.input, ...(errors.email && styles.inputError) }}
              placeholder="you@example.com"
            />
            {errors.email && <span style={styles.fieldError}>{errors.email.message}</span>}
          </label>
          <label style={styles.label}>
            Password
            <input
              type="password"
              {...register("password", { onChange: () => setServerError(null) })}
              style={{ ...styles.input, ...(errors.password && styles.inputError) }}
              placeholder="••••••••"
            />
            {errors.password && <span style={styles.fieldError}>{errors.password.message}</span>}
          </label>
          {serverError && <p style={styles.error}>{serverError}</p>}
          <button type="submit" disabled={isSubmitting} style={styles.btn}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f9fafb",
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "2rem",
    width: "100%",
    maxWidth: "380px",
  },
  title: {
    marginBottom: "1.5rem",
    fontSize: "1.4rem",
    fontWeight: 700,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
  },
  input: {
    padding: "0.5rem 0.75rem",
    fontSize: "0.95rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
  },
  inputError: {
    border: "1px solid #dc2626",
  },
  fieldError: {
    color: "#dc2626",
    fontSize: "0.8rem",
  },
  error: {
    color: "#dc2626",
    fontSize: "0.85rem",
    margin: 0,
  },
  btn: {
    padding: "0.6rem",
    fontSize: "0.95rem",
    fontWeight: 600,
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "0.25rem",
  },
};
