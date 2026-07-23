import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/guard";
import { clearAdminSession } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/users", label: "Users" },
  { href: "/dashboard/subscribers", label: "Subscribers" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/news", label: "News" },
  { href: "/dashboard/feedback", label: "Feedback" },
  { href: "/dashboard/pages", label: "Pages" },
  { href: "/dashboard/seo-services", label: "SEO Services" },
  { href: "/dashboard/locations", label: "Location Images" },
  { href: "/dashboard/seo-pages", label: "SEO Pages" },
];
async function logout() {
  "use server";
  await clearAdminSession();
  redirect("/login");
}

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminPage();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <strong>Servicelink</strong>
          <span>Super Admin</span>
        </div>
        <nav className="admin-nav" aria-label="Admin">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>
              Signed in as {session.name}
            </p>
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "#94a3b8" }}>
              {session.email} · {session.role}
            </p>
          </div>
          <form action={logout}>
            <button className="admin-btn admin-btn--ghost" type="submit">
              Sign out
            </button>
          </form>
        </header>
        {children}
      </div>
    </div>
  );
}
