import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = postgres(url);

try {
  const [row] = await sql`SELECT current_database() AS db, current_user AS user, version()`;
  console.log("Connected successfully.");
  console.log("Database:", row.db);
  console.log("User:", row.user);

  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;

  if (tables.length === 0) {
    console.log("No tables found — run: npm run db:seed");
  } else {
    console.log("Tables:", tables.map((t) => t.table_name).join(", "));
  }
} catch (error) {
  console.error("Connection failed:", error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await sql.end();
}
