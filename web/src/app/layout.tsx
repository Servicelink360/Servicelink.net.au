import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SiteChrome } from "@/components/SiteChrome";
import {
  createRootMetadata,
  getOrganizationJsonLd,
  getWebSiteJsonLd,
} from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = createRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-slate-900 antialiased">
        <JsonLd data={[getOrganizationJsonLd(), getWebSiteJsonLd()]} />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
