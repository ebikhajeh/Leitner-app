import { execSync } from "child_process";
import path from "path";
import dotenv from "dotenv";

const serverDir = path.resolve(__dirname, "../server");
const testEnv = { ...process.env, NODE_ENV: "test" };

dotenv.config({ path: path.resolve(serverDir, ".env.test"), override: true });

export default async function globalSetup() {
  execSync("bun src/db-ensure.ts", {
    cwd: serverDir,
    env: testEnv,
    stdio: "inherit",
  });

  execSync("bun prisma migrate deploy", {
    cwd: serverDir,
    env: testEnv,
    stdio: "inherit",
  });

  execSync("bun src/seed.ts", {
    cwd: serverDir,
    env: testEnv,
    stdio: "inherit",
  });
}
