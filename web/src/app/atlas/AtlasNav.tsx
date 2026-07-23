"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { atlasNavLinks } from "./data";

export function AtlasNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  function isActive(href: string) {
    if (href === "/atlas") return pathname === "/atlas";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e0d4]/80 bg-[#f6f3ee]/92 backdrop-blur-lg">
      <div className="atlas-container flex items-center justify-between py-3.5">
        <Link href="/atlas" className="block overflow-visible" onClick={close}>
          <Logo className="h-12 w-auto origin-left scale-[1.56]" />
        </Link>

        <button
          type="button"
          className="rounded-lg border border-[#e7e0d4] px-3 py-2 text-sm font-medium text-[#57534e] md:hidden"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>

        <nav
          className={`${
            open ? "flex" : "hidden"
          } absolute left-0 right-0 top-full flex-col gap-1 border-b border-[#e7e0d4] bg-[#f6f3ee] p-4 shadow-lg md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          {atlasNavLinks.map((link) => {
            const isContact = link.href === "/atlas/contact";

            if (isContact) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="atlas-btn-primary mt-2 rounded-full px-5 py-2.5 text-center text-sm font-semibold md:mt-0"
                >
                  {link.label}
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                data-active={isActive(link.href) ? "true" : "false"}
                className="atlas-nav-link rounded-md px-2 py-2 text-sm font-medium md:py-0"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
