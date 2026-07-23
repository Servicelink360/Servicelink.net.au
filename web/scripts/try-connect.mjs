import postgres from "postgres";

const databases = ["servicelink", "serviclink", "postgres"];
const users = [
  { user: "servicelink", password: "servicelink" },
  { user: "postgres", password: "postgres" },
  { user: "postgres", password: "admin" },
  { user: "postgres", password: "" },
];

for (const db of databases) {
  for (const { user, password } of users) {
    const auth = password ? `${user}:${password}` : user;
    const url = `postgresql://${auth}@localhost:5432/${db}`;
    const sql = postgres(url, { connect_timeout: 3, max: 1 });
    try {
      const [row] = await sql`SELECT current_database() AS db, current_user AS user`;
      console.log("SUCCESS:", url.replace(password || "", "***"));
      console.log("Database:", row.db, "| User:", row.user);
      await sql.end();
      process.exit(0);
    } catch {
      await sql.end({ timeout: 1 }).catch(() => undefined);
    }
  }
}

console.log("No working connection found. Update web/.env with your pgAdmin username and password.");
process.exit(1);
