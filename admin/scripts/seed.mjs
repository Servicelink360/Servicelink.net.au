import bcrypt from "bcryptjs";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const sql = postgres(url);

await sql`
  CREATE TABLE IF NOT EXISTS admins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(255) NOT NULL UNIQUE,
    password_hash varchar(255) NOT NULL,
    name varchar(255) NOT NULL,
    role varchar(32) NOT NULL DEFAULT 'super_admin',
    created_at timestamptz NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS site_pages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar(255) NOT NULL,
    slug varchar(255) NOT NULL UNIQUE,
    content text NOT NULL DEFAULT '',
    published boolean NOT NULL DEFAULT false,
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
  )
`;

await sql`
  ALTER TABLE site_pages
  ADD COLUMN IF NOT EXISTS page_type varchar(32) NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS settings text
`;

await sql`
  ALTER TABLE site_pages
  ALTER COLUMN content SET DEFAULT ''
`;

const email = "admin@servicelink.net.au";
const password = "Admin123!";
const passwordHash = await bcrypt.hash(password, 12);

await sql`
  INSERT INTO admins (email, password_hash, name, role)
  VALUES (${email}, ${passwordHash}, ${"Super Admin"}, ${"super_admin"})
  ON CONFLICT (email) DO NOTHING
`;

console.log("Admin tables ready.");
console.log("");
console.log("Super admin login:");
console.log("  Email:    admin@servicelink.net.au");
console.log("  Password: Admin123!");
console.log("");
console.log("Change this password after first login.");

await sql.end();
