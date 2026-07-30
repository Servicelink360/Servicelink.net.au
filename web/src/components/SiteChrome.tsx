"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { Header } from "./Header";

type SiteChromeProps = {
  children: React.ReactNode;
};

const STANDALONE_PREFIXES = ["/atlas", "/works"];

function isMainSite(pathname: string | null) {
  if (!pathname) return false;
  if (STANDALONE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }
  if (pathname.startsWith("/legal")) return false;
  return true;
}

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();

  if (isMainSite(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
