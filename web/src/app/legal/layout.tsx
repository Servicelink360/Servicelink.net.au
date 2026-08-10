import { SiteShell } from "@/site/SiteShell";

export default function LegalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SiteShell>{children}</SiteShell>;
}
