import type { Metadata } from "next";
import { createNoIndexMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { AtlasFooter } from "./AtlasFooter";
import { AtlasNav } from "./AtlasNav";
import "./atlas.css";

export const metadata: Metadata = createNoIndexMetadata(
  site.name,
  site.description,
);

export default function AtlasLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="atlas-page flex min-h-screen flex-col">
      <AtlasNav />
      <main className="flex-1">{children}</main>
      <AtlasFooter />
    </div>
  );
}
