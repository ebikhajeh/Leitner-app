import "dotenv/config";
import { Client } from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("Missing DATABASE_URL");

// Parse the target database name and build a connection to the default `postgres` db
const url = new URL(databaseUrl);
const dbName = url.pathname.slice(1).split("?")[0]; // strip leading / and query string
url.pathname = "/postgres";
url.search = "";

const client = new Client({ connectionString: url.toString() });

try {
  await client.connect();

  const { rowCount } = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName]
  );

  if (rowCount === 0) {
    await client.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
    console.log(`Created database: ${dbName}`);
  } else {
    console.log(`Database already exists: ${dbName}`);
  }

  await client.end();
  process.exit(0);
} catch (err: any) {
  await client.end().catch(() => {});

  if (err.code === "42501") {
    console.error(
      `\nInsufficient privileges to create the database automatically.` +
        `\nCreate it manually with one of:\n` +
        `\n  createdb -U postgres ${dbName}` +
        `\n  psql -U postgres -c 'CREATE DATABASE "${dbName}"'\n`
    );
    process.exit(1);
  }

  console.error("Database check failed:", err);
  process.exit(1);
}
