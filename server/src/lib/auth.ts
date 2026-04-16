import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";

const CLIENT_URL = process.env.CLIENT_URL;
if (!CLIENT_URL) throw new Error("Missing required env var: CLIENT_URL");

const DB_PROVIDER = process.env.DB_PROVIDER;
if (!DB_PROVIDER) throw new Error("Missing required env var: DB_PROVIDER");

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: DB_PROVIDER as "postgresql" }),
  emailAndPassword: { enabled: true },
  trustedOrigins: [CLIENT_URL],
});
