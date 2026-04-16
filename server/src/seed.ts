import "dotenv/config";
import { db } from "./lib/db";
import { auth } from "./lib/auth";

const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASSWORD;

if (!email) throw new Error("Missing required env var: TEST_USER_EMAIL");
if (!password) throw new Error("Missing required env var: TEST_USER_PASSWORD");

try {
  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`User ${email} already exists — skipping.`);
    process.exit(0);
  }

  await auth.api.signUpEmail({
    body: { email, password, name: email },
  });

  console.log(`Created user: ${email}`);
  process.exit(0);
} catch (err) {
  console.error("Seed failed:", err);
  process.exit(1);
}
