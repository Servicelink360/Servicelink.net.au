import { spawnSync } from "child_process";
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import postgres from "postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");

const password = process.env.PG_PASSWORD ?? process.argv[2];
const database = process.env.PG_DATABASE ?? "servicelink";
const host = process.env.PG_HOST ?? "localhost";
const port = process.env.PG_PORT ?? "5432";
const user = process.env.PG_USER ?? "postgres";

if (!password) {
  console.error("Usage (PowerShell):");
  console.error('  $env:PG_PASSWORD="your-pgadmin-password"; npm run db:connect');
  console.error("");
  console.error("Or:");
  console.error("  npm run db:connect -- your-pgadmin-password");
  process.exit(1);
}

const encoded = encodeURIComponent(password);
const url = `postgresql://${user}:${encoded}@${host}:${port}/${database}`;
const sql = postgres(url, { connect_timeout: 8, max: 1 });

try {
  const [row] = await sql`SELECT current_database() AS db, current_user AS user`;
  console.log("Connected:", row.db, "as", row.user);

  const envPath = join(webRoot, ".env");
  const envContent = `DATABASE_URL=${url}\n`;
  writeFileSync(envPath, envContent, "utf8");
  console.log("Updated web/.env");

  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
  `;

  if (tables.length === 0) {
    console.log("Creating tables...");
    await sql.end();

    process.env.DATABASE_URL = url;
    const seed = spawnSync("node", ["scripts/seed.mjs"], {
      cwd: webRoot,
      env: process.env,
      stdio: "inherit",
      shell: true,
    });
    process.exit(seed.status ?? 0);
  }

  console.log("Tables:", tables.map((t) => t.table_name).join(", "));
  console.log("Database is ready. Restart the dev server if it is running.");
} catch (error) {
  console.error("Connection failed:", error instanceof Error ? error.message : error);
  console.error("");
  console.error("Check in pgAdmin:");
  console.error("  1. Database name is servicelink");
  console.error("  2. postgres user password matches what you entered");
  process.exit(1);
} finally {
  await sql.end({ timeout: 1 }).catch(() => undefined);
}
