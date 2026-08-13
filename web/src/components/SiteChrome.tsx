"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { CaptureAttribution } from "./CaptureAttribution";
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
  return true;
}

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();

  const tracker = (
    <Suspense fallback={null}>
      <CaptureAttribution />
    </Suspense>
  );

  if (isMainSite(pathname)) {
    return (
      <>
        {tracker}
        {children}
      </>
    );
  }

  return (
    <>
      {tracker}
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
