import type { Metadata } from "next";
import { createNoIndexMetadata } from "@/lib/seo";
import "./works.css";

export const metadata: Metadata = createNoIndexMetadata(
  "FacilityPulse — Facilities Management Software",
  "Mock homepage inspired by modern facilities management software platforms.",
);

export default function WorksLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="works-page min-h-screen">{children}</div>;
}
