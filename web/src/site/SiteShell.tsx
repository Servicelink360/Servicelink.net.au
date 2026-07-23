import { Outfit, Source_Serif_4 } from "next/font/google";
import "@/styles/blocks.css";
import "./site.css";

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-m1-sans",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-m1-serif",
  display: "swap",
});

export function SiteShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={`m1 ${sans.variable} ${serif.variable}`}>{children}</div>;
}
