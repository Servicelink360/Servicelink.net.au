import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Servicelink Admin",
  description: "Super admin panel for Servicelink",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
