import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";
import { sendPasswordResetEmail } from "./emailService";
import { CLIENT_URL, DB_PROVIDER } from "./authEnv";
import { AUTH_CONFIG } from "./authConfig";

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
});
