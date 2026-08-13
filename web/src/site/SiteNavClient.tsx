"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import type { StateGroup } from "@/lib/location-states";
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

type SiteNavClientProps = {
  stateGroups?: StateGroup[];
};

export function SiteNavClient({ stateGroups = [] }: SiteNavClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [mobileLocationsOpen, setMobileLocationsOpen] = useState(false);
  const [openState, setOpenState] = useState<string | null>(null);
  const locationsRef = useRef<HTMLDivElement>(null);
  const isHome = pathname === "/";
  const serviceTel = `tel:${site.contact.serviceNumber}`;
  const locationsActive =
    pathname === "/locations" || pathname.startsWith("/locations/");
  const states =
    stateGroups.length > 0
      ? stateGroups
      : locationStateLinks.map((state) => ({
          code: state.label,
          label: state.label,
          href: state.href,
          cities: [],
        }));

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
        setOpenState(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const close = () => {
    setMenuOpen(false);
    setLocationsOpen(false);
    setMobileLocationsOpen(false);
    setOpenState(null);
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
                    onMouseLeave={() => {
                      setLocationsOpen(false);
                      setOpenState(null);
                    }}
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
                      <Link href="/locations" role="menuitem" onClick={close}>
                        All locations
                      </Link>
                      {states.map((state) => (
                        <div
                          key={state.code}
                          className="m1-nav__drop-item"
                          onMouseEnter={() => setOpenState(state.code)}
                          onMouseLeave={() =>
                            setOpenState((current) => (current === state.code ? null : current))
                          }
                        >
                          <Link
                            href={state.href}
                            role="menuitem"
                            aria-haspopup={state.cities.length > 0}
                            aria-expanded={openState === state.code}
                            onClick={close}
                          >
                            {state.label}
                            {state.cities.length > 0 ? (
                              <span className="m1-nav__drop-more" aria-hidden>
                                ▸
                              </span>
                            ) : null}
                          </Link>
                          {state.cities.length > 0 && openState === state.code ? (
                            <div className="m1-nav__drop-cities" role="menu">
                              <Link href={state.href} role="menuitem" onClick={close}>
                                All {state.label} cities
                              </Link>
                              {state.cities.map((city) => (
                                <Link
                                  key={city.id}
                                  href={`/locations/${city.slug}`}
                                  role="menuitem"
                                  onClick={close}
                                >
                                  {city.name}
                                </Link>
                              ))}
                            </div>
                          ) : null}
                        </div>
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
                      {states.map((state) => (
                        <div key={state.code} className="m1-drawer__state">
                          <button
                            type="button"
                            className="m1-drawer__state-trigger"
                            aria-expanded={openState === state.code}
                            onClick={() =>
                              setOpenState((current) => (current === state.code ? null : state.code))
                            }
                          >
                            {state.label}
                            <span aria-hidden>{openState === state.code ? "▴" : "▾"}</span>
                          </button>
                          {openState === state.code ? (
                            <div className="m1-drawer__cities">
                              <Link href={state.href} onClick={close}>
                                All {state.label} cities
                              </Link>
                              {state.cities.map((city) => (
                                <Link
                                  key={city.id}
                                  href={`/locations/${city.slug}`}
                                  onClick={close}
                                >
                                  {city.name}
                                </Link>
                              ))}
                            </div>
                          ) : null}
                        </div>
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
