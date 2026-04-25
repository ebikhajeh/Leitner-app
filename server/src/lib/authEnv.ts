function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const CLIENT_URL = requireEnv("CLIENT_URL");
export const DB_PROVIDER = requireEnv("DB_PROVIDER");
export const BETTER_AUTH_SECRET = requireEnv("BETTER_AUTH_SECRET");
