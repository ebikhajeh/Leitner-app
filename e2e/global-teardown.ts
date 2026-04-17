import { execSync } from "child_process";
import path from "path";
import dotenv from "dotenv";

const serverDir = path.resolve(__dirname, "../server");

// Must load before building testEnv so DATABASE_URL from .env.test is included
dotenv.config({ path: path.resolve(serverDir, ".env.test"), override: true });

const testEnv = { ...process.env, NODE_ENV: "test" };

export default async function globalTeardown() {
  execSync("bun src/db-teardown.ts", {
    cwd: serverDir,
    env: testEnv,
    stdio: "inherit",
  });
}
