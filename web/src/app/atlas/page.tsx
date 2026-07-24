import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Home",
};

const quickLinks = [
  {
    href: "/atlas/services",
    title: "Our services",
    text: "Cleaning, maintenance, grounds care, tree management, and more.",
  },
  {
    href: "/atlas/about",
    title: "About us",
    text: "Why councils and government partners trust Servicelink.",
  },
  {
    href: "/atlas/clients",
    title: "Our clients",
    text: "NSW Government and Sydney councils we proudly support.",
  },
  {
    href: "/atlas/contact",
    title: "Contact",
    text: "Speak with our Sydney team about your facility needs.",
  },
];

export default function AtlasHomePage() {
  return (
    <>
      <section className="relative overflow-hidden pb-0 pt-10 md:pt-14">
        <div className="atlas-blob left-[-10%] top-0 h-72 w-72 bg-[#b85c38]/18" aria-hidden />
        <div className="atlas-blob right-[-5%] top-16 h-96 w-96 bg-[#3f5c47]/12" aria-hidden />
        <div className="atlas-pattern absolute inset-0 opacity-25" aria-hidden />

        <div className="atlas-container relative pb-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="atlas-eyebrow">{site.contact.location}</p>
              <h1 className="atlas-serif mt-4 text-4xl leading-[1.1] tracking-tight md:text-5xl lg:text-[3.1rem]">
                {site.tagline}
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-[#57534e] md:text-lg">
                {site.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/atlas/contact"
                  className="atlas-btn-primary rounded-full px-6 py-3 text-sm font-semibold"
                >
                  Get in touch
                </Link>
                <Link
                  href="/atlas/services"
                  className="atlas-btn-outline rounded-full px-6 py-3 text-sm font-semibold"
                >
                  Our services
                </Link>
              </div>
            </div>

            <div className="atlas-float relative">
              <div className="relative aspect-[5/4] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-[#e7e0d4]">
                <Image
                  src="/images/slider/apac1.jpg"
                  alt="Aquatic centre managed by Servicelink"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-[#e7e0d4] bg-[#fffdf9] px-4 py-3 shadow-lg md:block">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#b85c38]">
                  Since 2018
                </p>
                <p className="atlas-serif text-sm font-semibold text-[#1c1917]">
                  Sydney facilities partner
                </p>
              </div>
            </div>
          </div>

          <div className="atlas-hero-panel relative z-10 -mb-6 mt-10 grid grid-cols-1 divide-y divide-[#e7e0d4] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {site.stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center px-6 py-6 text-center sm:py-7 ${
                  i === 0 ? "sm:items-start sm:text-left" : ""
                } ${i === site.stats.length - 1 ? "sm:items-end sm:text-right" : ""}`}
              >
                <dt className="text-3xl font-semibold tracking-tight text-[#3f5c47]">
                  {stat.value}
                </dt>
                <dd className="mt-1 max-w-[10rem] text-xs leading-relaxed text-[#57534e]">
                  {stat.label}
                </dd>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#e7e0d4] bg-[#fffdf9] pb-12 pt-14">
        <div className="atlas-container">
          <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-[#a8a29e]">
            Trusted by councils and government across Sydney
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {site.clients.map((name) => (
              <Link key={name} href="/atlas/clients" className="atlas-trust-pill">
                {name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="atlas-section">
        <div className="atlas-container">
          <div className="grid gap-5 sm:grid-cols-2">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="atlas-card group rounded-2xl p-7"
              >
                <h2 className="atlas-serif text-xl text-[#1c1917]">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#57534e]">{item.text}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3f5c47] group-hover:text-[#b85c38]">
                  Explore
                  <span aria-hidden className="transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="atlas-quote-band px-5 py-20 text-white md:py-24">
        <blockquote className="atlas-container max-w-3xl text-center">
          <p className="atlas-serif text-2xl leading-relaxed md:text-[1.75rem]">
            &ldquo;At Servicelink, we believe in continuous improvement by listening to our
            customers. We tailor solutions to each facility and proactively address issues
            before they escalate.&rdquo;
          </p>
          <footer className="mt-8 text-sm text-white/65">— {site.name}</footer>
        </blockquote>
      </section>
    </>
  );
}
