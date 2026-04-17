import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env.test"), override: false });
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: false });
import { Client } from "pg";

const client = new Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  await client.query(
    `TRUNCATE TABLE "User", "Session", "Account", "Verification" RESTART IDENTITY CASCADE`
  );
  console.log("Test database truncated.");
  await client.end();
  process.exit(0);
} catch (err) {
  console.error("Teardown failed:", err);
  process.exit(1);
}
