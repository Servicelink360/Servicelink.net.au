import Image from "@/components/SiteImage";
import Link from "next/link";
import { WorksContactForm } from "./WorksContactForm";

const stats = [
  { value: "5,800+", label: "Buildings managed" },
  { value: "1.85M+", label: "Work orders sent" },
  { value: "328K+", label: "Assets managed" },
  { value: "100K+", label: "Platform users" },
];

const painPoints = [
  "Reactive maintenance increases cost and asset failure.",
  "Incomplete records create compliance and audit risk.",
  "Disconnected systems reduce visibility across sites.",
  "Decisions need to be made with real-time, reliable data.",
];

const features = [
  {
    title: "Always audit-ready, zero surprises",
    text: "Stay continuously compliant with automated tracking, scheduled reminders and centralised documentation — prepared for regulatory audits and inspections.",
    image: "/images/slider/comcenter.jpg",
  },
  {
    title: "Fix problems before they happen",
    text: "Preventative maintenance scheduling keeps assets serviced, facilities operational and teams out of reactive mode.",
    image: "/images/figure1.png",
    reverse: true,
  },
  {
    title: "One platform, every facility",
    text: "Manage maintenance, assets, contractors and compliance across every site from a single dashboard — whether you run two sites or two hundred.",
    image: "/images/clients/inner-west.jpg",
  },
];

const complianceStats = [
  { value: "One", label: "Platform for compliance, contractors and assets." },
  { value: "Zero", label: "Lapsed credentials with automated expiry alerts." },
  { value: "100%", label: "Audit-ready documentation, always on hand." },
];

const logos = [
  "Metro Health Network",
  "Southern Council",
  "Pacific Education",
  "Harbour Aged Care",
  "Regional Sports Trust",
  "Unity Non-Profit",
];

const testimonials = [
  {
    quote:
      "Lean operations needs software if there's any chance of meeting compliance requirements. It helps me sleep better at night knowing everything is under control.",
    name: "Kel Oswin",
    role: "Support Services Manager",
    org: "Regional Health Service",
  },
  {
    quote:
      "Improving visibility enables us to make data-driven decisions, implemented through standardised processes across all our sites.",
    name: "Cameron Lamb",
    role: "National Facilities Manager",
    org: "Standards Authority",
  },
];

const caseStudies = [
  {
    title: "Colac Area Health",
    text: "Reduced compliance reporting time from 1.5 days to minutes.",
  },
  {
    title: "The George Centre",
    text: "Four new hospital sites. Paperless from day one. Audit-ready.",
  },
  {
    title: "Racing Queensland",
    text: "15 sites. 115+ clubs. One unified facilities system.",
  },
  {
    title: "Mercy Hospital",
    text: "Cloud-ready in 8 weeks. 40%+ staff onboard from day one.",
  },
];

const industries = [
  "Hospitals + Healthcare",
  "Aged Care",
  "Education",
  "Retail & Hospitality",
  "Sport & Recreation",
  "Council & Non-Profit",
];

const faqs = [
  {
    q: "What is FacilityPulse?",
    a: "FacilityPulse is a mock facilities management platform concept that brings maintenance, assets, compliance and operations together in one intelligent system.",
  },
  {
    q: "Can it manage multiple sites?",
    a: "Yes — the platform is designed for multi-site portfolios, giving executives and operations teams centralised visibility across every location.",
  },
  {
    q: "Does it help with contractor compliance?",
    a: "Credential tracking, expiry alerts, digital sign-in and site inductions keep every contractor verified before work begins.",
  },
  {
    q: "Does it work on mobile devices?",
    a: "The concept is built as a responsive web app accessible from smartphones, tablets and laptops in the field.",
  },
];

export default function WorksHomePage() {
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#e2e8f0] bg-white/90 backdrop-blur-md">
        <div className="works-container flex items-center justify-between py-4">
          <Link href="/works" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a5cff] text-sm font-bold text-white">
              FP
            </span>
            <span className="text-lg font-bold tracking-tight text-[#0f172a]">
              FacilityPulse
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#5b6472] lg:flex">
            <a href="#platform" className="hover:text-[#0f172a]">
              Platform
            </a>
            <a href="#industries" className="hover:text-[#0f172a]">
              Industries
            </a>
            <a href="#customers" className="hover:text-[#0f172a]">
              Customers
            </a>
            <a href="#faq" className="hover:text-[#0f172a]">
              FAQ
            </a>
            <a href="#contact" className="works-btn-primary px-5 py-2.5 text-sm">
              Book a demo
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="works-gradient-hero relative overflow-hidden">
        <div className="works-mesh absolute inset-0 opacity-50" aria-hidden />
        <div className="works-container relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1a5cff]">
              Facilities management software
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-[#0b1f3a] md:text-5xl lg:text-[3.4rem]">
              Smarter facilities management software starts here
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#5b6472]">
              FacilityPulse brings maintenance, assets and compliance together into a
              single platform — giving teams real-time visibility and control across all
              sites.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contact" className="works-btn-primary px-7 py-3.5 text-sm">
                Book a demo →
              </a>
              <a href="#platform" className="works-btn-outline px-7 py-3.5 text-sm">
                Explore platform
              </a>
            </div>
          </div>

          <div className="works-float relative">
            <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-2xl shadow-blue-500/10">
              <div className="border-b border-[#e2e8f0] bg-[#f8fbff] px-5 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                </div>
              </div>
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                {[
                  { label: "Open work orders", val: "24" },
                  { label: "Assets due service", val: "8" },
                  { label: "Compliance alerts", val: "0" },
                  { label: "Sites online", val: "12" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4"
                  >
                    <p className="text-2xl font-bold text-[#1a5cff]">{item.val}</p>
                    <p className="mt-1 text-xs text-[#5b6472]">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#e2e8f0] p-5">
                <div className="h-2 rounded-full bg-[#e2e8f0]">
                  <div className="h-2 w-3/4 rounded-full bg-[#1a5cff]" />
                </div>
                <p className="mt-2 text-xs text-[#5b6472]">
                  Preventative maintenance completion — 76%
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="border-y border-[#e2e8f0] bg-[#f8fafc] py-16">
        <div className="works-container grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#0b1f3a] md:text-4xl">
              Built for facility teams. Driven by data.
            </h2>
            <p className="mt-4 text-[#5b6472]">
              Managing facilities across multiple sites is increasingly complex.
              FacilityPulse brings maintenance, assets, compliance and operations together
              in one intelligent platform.
            </p>
          </div>
          <ul className="space-y-4">
            {painPoints.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 rounded-xl border border-[#e2e8f0] bg-white px-5 py-4 text-sm text-[#5b6472]"
              >
                <span className="mt-0.5 text-[#1a5cff]">→</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="works-container text-center">
          <h2 className="text-2xl font-bold text-[#0b1f3a] md:text-3xl">
            Simple. Convenient. Compliant.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[#5b6472]">
            One platform for facilities, assets and compliance — trusted by organisations
            managing:
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="works-stat works-card">
                <p className="works-stat-value">{stat.value}</p>
                <p className="works-stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="platform" className="bg-[#f8fafc] py-20">
        <div className="works-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-[#0b1f3a] md:text-4xl">
              Total control of your facilities — without the complexity
            </h2>
            <p className="mt-4 text-[#5b6472]">
              Designed to streamline routine tasks and give your facility team time to
              focus on what matters.
            </p>
          </div>

          <div className="mt-16 space-y-16">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`grid items-center gap-10 lg:grid-cols-2 ${
                  feature.reverse ? "lg:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#e2e8f0] shadow-lg">
                  <Image
                    src={feature.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#0b1f3a]">{feature.title}</h3>
                  <p className="mt-4 leading-relaxed text-[#5b6472]">{feature.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance band */}
      <section className="bg-[#0b1f3a] py-20 text-white">
        <div className="works-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Compliance that works as hard as your care teams
            </h2>
            <p className="mt-4 text-slate-300">
              Built for healthcare and aged care facilities across Australia and New
              Zealand. FacilityPulse handles the compliance heavy lifting.
            </p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {complianceStats.map((item) => (
              <div key={item.value} className="text-center">
                <p className="works-big-number">{item.value}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logos */}
      <section id="customers" className="py-16">
        <div className="works-container">
          <h2 className="text-center text-2xl font-bold text-[#0b1f3a]">Our customers</h2>
          <p className="mt-2 text-center text-sm text-[#5b6472]">
            Organisations and facility teams using our solutions every day (mock names)
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {logos.map((name) => (
              <div key={name} className="works-logo-tile">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-[#e2e8f0] bg-[#f8fafc] py-20">
        <div className="works-container grid gap-8 md:grid-cols-2">
          {testimonials.map((item) => (
            <blockquote key={item.name} className="works-card works-quote p-8">
              <p className="text-[#5b6472] leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
              <footer className="mt-6">
                <p className="font-semibold text-[#0f172a]">{item.name}</p>
                <p className="text-sm text-[#5b6472]">
                  {item.role}, {item.org}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Case studies */}
      <section className="py-20">
        <div className="works-container">
          <h2 className="text-center text-3xl font-bold text-[#0b1f3a]">
            Real stories. Real results.
          </h2>
          <p className="mt-3 text-center text-[#5b6472]">
            How facilities teams use the platform to solve challenges and drive results.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {caseStudies.map((study) => (
              <article key={study.title} className="works-card p-6">
                <h3 className="font-bold text-[#0f172a]">{study.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5b6472]">{study.text}</p>
                <span className="mt-5 inline-flex text-sm font-semibold text-[#1a5cff]">
                  Read more →
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="bg-[#f8fafc] py-20">
        <div className="works-container">
          <h2 className="text-center text-3xl font-bold text-[#0b1f3a]">
            Industries we serve
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <div
                key={industry}
                className="works-card flex items-center justify-between p-5 text-sm font-semibold text-[#0f172a]"
              >
                {industry}
                <span className="text-[#1a5cff]">→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="works-container max-w-3xl">
          <h2 className="text-center text-3xl font-bold text-[#0b1f3a]">
            Frequently asked questions
          </h2>
          <div className="works-faq mt-10 space-y-3">
            {faqs.map((item) => (
              <details key={item.q} className="works-card px-5 py-4 open:shadow-md">
                <summary className="flex items-center justify-between font-semibold text-[#0f172a]">
                  {item.q}
                  <span className="ml-4 text-[#1a5cff]">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#5b6472]">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-[#e2e8f0] bg-[#f8fafc] py-20">
        <div className="works-container grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-3xl font-bold text-[#0b1f3a]">Ready to get started?</h2>
            <p className="mt-4 text-[#5b6472]">
              This is a design mock inspired by{" "}
              <a
                href="https://www.fmiworks.com/"
                className="font-medium text-[#1a5cff] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                FMI Works
              </a>
              . Fill in your details and our team will get back to you.
            </p>
            <p className="mt-6 text-sm text-[#94a3b8]">
              Not affiliated with FMI Software Pty Ltd. Concept preview only.
            </p>
          </div>
          <WorksContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e2e8f0] bg-[#0b1f3a] py-12 text-slate-300">
        <div className="works-container">
          <div className="flex flex-col justify-between gap-8 md:flex-row">
            <div>
              <p className="text-lg font-bold text-white">FacilityPulse</p>
              <p className="mt-2 max-w-xs text-sm text-slate-400">
                Mock facilities management software homepage. Design concept only.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
              <div>
                <p className="font-semibold text-white">Platform</p>
                <ul className="mt-3 space-y-2 text-slate-400">
                  <li>Maintenance</li>
                  <li>Assets</li>
                  <li>Compliance</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white">Company</p>
                <ul className="mt-3 space-y-2 text-slate-400">
                  <li>About</li>
                  <li>Contact</li>
                  <li>Case studies</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white">Legal</p>
                <ul className="mt-3 space-y-2 text-slate-400">
                  <li>Privacy</li>
                  <li>Terms</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-10 border-t border-slate-700 pt-6 text-xs text-slate-500">
            © {new Date().getFullYear()} FacilityPulse mock. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
