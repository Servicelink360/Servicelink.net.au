import Link from "next/link";
import { Logo } from "@/components/Logo";
import { legalLinks } from "@/lib/legal";
import { site } from "@/lib/site";

export function AtlasFooter() {
  return (
    <footer className="atlas-footer px-5 py-12">
      <div className="atlas-container">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-center md:text-left">
            <Logo className="mx-auto h-12 w-auto md:mx-0" />
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-[#78716c]">
              {site.description}
            </p>
          </div>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[#78716c]">
              {legalLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-[#1c1917]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-8 border-t border-[#e7e0d4] pt-6 text-center text-xs text-[#a8a29e] md:text-left">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
