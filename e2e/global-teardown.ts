import { execSync } from "child_process";
import path from "path";
import dotenv from "dotenv";

const serverDir = path.resolve(__dirname, "../server");

dotenv.config({ path: path.resolve(serverDir, ".env.test"), override: true });

export default async function globalTeardown() {
  execSync("bun src/db-teardown.ts", {
    cwd: serverDir,
    env: { ...process.env, NODE_ENV: "test" },
    stdio: "inherit",
  });
}
