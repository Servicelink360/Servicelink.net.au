import Link from "next/link";
import { Logo } from "./Logo";
import { legalLinks } from "@/lib/legal";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="max-w-xl">
          <Logo className="h-12 w-auto" variant="light" />
          <p className="mt-4 text-sm leading-6 text-slate-400">{site.description}</p>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>

          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {legalLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-slate-400 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
