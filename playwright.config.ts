import { defineConfig, devices } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";

const serverTestEnv =
  dotenv.config({ path: path.resolve(__dirname, "server/.env.test") }).parsed ?? {};

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "bun --watch src/index.ts",
      cwd: path.resolve(__dirname, "server"),
      port: 3001,
      reuseExistingServer: !process.env.CI,
      env: { ...serverTestEnv, NODE_ENV: "test" },
    },
    {
      command: "bunx vite --mode test --port 5174",
      cwd: path.resolve(__dirname, "client"),
      port: 5174,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
