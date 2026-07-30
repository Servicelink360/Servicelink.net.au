"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { locationStateLinks, site } from "@/lib/site";

type NavItem = {
  href: string;
  label: string;
  page?: boolean;
};

const NAV: NavItem[] = [
  { href: "/", label: "Home", page: true },
  { href: "#work", label: "Services" },
  { href: "/locations", label: "Locations", page: true },
  { href: "/about", label: "About Us", page: true },
  { href: "/service360", label: "Service360", page: true },
  { href: "/news", label: "News", page: true },
  { href: "/join", label: "Join", page: true },
];

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [mobileLocationsOpen, setMobileLocationsOpen] = useState(false);
  const locationsRef = useRef<HTMLDivElement>(null);
  const isHome = pathname === "/";
  const serviceTel = `tel:${site.contact.serviceNumber}`;
  const locationsActive =
    pathname === "/locations" || pathname.startsWith("/locations/");

  const itemHref = (item: NavItem) =>
    item.page ? item.href : isHome ? item.href : `/${item.href}`;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locationsRef.current &&
        !locationsRef.current.contains(event.target as Node)
      ) {
        setLocationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const close = () => {
    setMenuOpen(false);
    setLocationsOpen(false);
    setMobileLocationsOpen(false);
  };

  const goHomeTop = (event: React.MouseEvent<HTMLAnchorElement>) => {
    close();
    if (pathname === "/") {
      event.preventDefault();
      if (window.location.hash) {
        window.history.replaceState(null, "", "/");
        router.replace("/");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="m1-nav">
        <div className="m1-wrap m1-nav__bar">
          <Link href="/" className="m1-logo" onClick={goHomeTop}>
            <Logo
              src="/logo/servicelink-logo.png"
              className="h-12 w-auto origin-left scale-[2.33]"
            />
          </Link>

          <nav className="m1-nav__desk" aria-label="Primary">
            {NAV.map((item) => {
              if (item.href === "/locations") {
                return (
                  <div
                    key={item.href}
                    ref={locationsRef}
                    className="m1-nav__drop"
                    onMouseEnter={() => setLocationsOpen(true)}
                    onMouseLeave={() => setLocationsOpen(false)}
                  >
                    <button
                      type="button"
                      className="m1-nav__drop-trigger"
                      aria-expanded={locationsOpen}
                      aria-haspopup="true"
                      data-active={locationsActive ? "true" : "false"}
                      onClick={() => setLocationsOpen((open) => !open)}
                    >
                      Locations
                      <span className="m1-nav__drop-caret" aria-hidden>
                        ▾
                      </span>
                    </button>

                    <div
                      className={`m1-nav__drop-menu ${
                        locationsOpen ? "m1-nav__drop-menu--open" : ""
                      }`}
                      role="menu"
                      aria-label="Locations by state"
                    >
                      <Link
                        href="/locations"
                        role="menuitem"
                        onClick={close}
                      >
                        All locations
                      </Link>
                      {locationStateLinks.map((state) => (
                        <Link
                          key={state.href}
                          href={state.href}
                          role="menuitem"
                          onClick={close}
                        >
                          {state.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={itemHref(item)}
                  onClick={item.href === "/" ? goHomeTop : close}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="m1-nav__end">
            <a
              href={serviceTel}
              className="m1-btn m1-btn--ink m1-nav__cta"
              aria-label={`Service number ${site.contact.serviceNumberDisplay}`}
            >
              {site.contact.serviceNumberDisplay}
            </a>
            <Link href="/contact" className="m1-btn m1-btn--ink m1-nav__cta" onClick={close}>
              Contact Us
            </Link>
            <button
              type="button"
              className="m1-nav__burger"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`m1-drawer ${menuOpen ? "m1-drawer--open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Mobile">
          {NAV.map((item) => {
            if (item.href === "/locations") {
              return (
                <div key={item.href} className="m1-drawer__group">
                  <button
                    type="button"
                    className="m1-drawer__group-trigger"
                    aria-expanded={mobileLocationsOpen}
                    onClick={() => setMobileLocationsOpen((open) => !open)}
                  >
                    Locations
                    <span aria-hidden>{mobileLocationsOpen ? "▴" : "▾"}</span>
                  </button>
                  {mobileLocationsOpen ? (
                    <div className="m1-drawer__sub">
                      <Link href="/locations" onClick={close}>
                        All locations
                      </Link>
                      {locationStateLinks.map((state) => (
                        <Link key={state.href} href={state.href} onClick={close}>
                          {state.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={itemHref(item)}
                onClick={item.href === "/" ? goHomeTop : close}
              >
                {item.label}
              </Link>
            );
          })}
          <a href={serviceTel} className="m1-btn m1-btn--ink" onClick={close}>
            {site.contact.serviceNumberDisplay}
          </a>
          <Link href="/contact" className="m1-btn m1-btn--ink" onClick={close}>
            Contact Us
          </Link>
        </nav>
      </div>
    </>
  );
}
