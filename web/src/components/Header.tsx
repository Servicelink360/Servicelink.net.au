"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clientLinks } from "@/lib/clients";
import { Logo } from "./Logo";
import { clientsNavLabel, navigation } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [clientsOpen, setClientsOpen] = useState(false);
  const clientsRef = useRef<HTMLDivElement>(null);

  const clientsActive = pathname.startsWith("/clients");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        clientsRef.current &&
        !clientsRef.current.contains(event.target as Node)
      ) {
        setClientsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function closeMenus() {
    setMenuOpen(false);
    setClientsOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="shrink-0 overflow-visible" onClick={closeMenus}>
          <Logo className="h-12 w-auto origin-left scale-[1.56]" />
        </Link>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        <nav
          id="site-navigation"
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 right-0 top-full flex-col border-b border-slate-200 bg-white px-4 py-4 shadow-sm md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          {navigation.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenus}
              className={navLinkClass(
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href),
              )}
            >
              {item.label}
            </Link>
          ))}

          <div ref={clientsRef} className="relative">
            <button
              type="button"
              aria-expanded={clientsOpen}
              aria-haspopup="true"
              onClick={() => setClientsOpen((value) => !value)}
              className={`${navLinkClass(clientsActive)} w-full text-left md:w-auto`}
            >
              {clientsNavLabel}
              <span className="ml-1 text-xs" aria-hidden>
                ▾
              </span>
            </button>

            {clientsOpen ? (
              <div className="mt-1 rounded-md border border-slate-200 bg-white py-2 md:absolute md:left-0 md:top-full md:min-w-72 md:shadow-lg">
                {clientLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenus}
                    className={`block px-4 py-2 text-sm ${
                      pathname === item.href
                        ? "bg-emerald-50 font-medium text-emerald-800"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {navigation.slice(4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenus}
              className={navLinkClass(pathname.startsWith(item.href))}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function navLinkClass(active: boolean) {
  return `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    active
      ? "bg-emerald-50 text-emerald-800"
      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
  }`;
}
