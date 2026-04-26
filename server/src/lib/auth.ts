import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";
import { sendPasswordResetEmail } from "./emailService";
import { CLIENT_URL, DB_PROVIDER } from "./authEnv";
import { AUTH_CONFIG } from "./authConfig";

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: DB_PROVIDER as "postgresql" }),
  emailAndPassword: {
    enabled: true,
    ...AUTH_CONFIG,
    sendResetPassword: async ({ user, url }) => {
      // Fire-and-forget to prevent timing attacks
      void sendPasswordResetEmail(user.email, url);
    },
  },
  trustedOrigins: [CLIENT_URL],
  advanced: {
    // Cross-site cookies required for Vercel (frontend) ↔ Render (backend) in production
    defaultCookieAttributes: {
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    },
  },
});
