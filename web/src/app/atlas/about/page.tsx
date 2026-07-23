import type { Metadata } from "next";
import { site } from "@/lib/site";
import { AtlasPageHero } from "../AtlasPageHero";
import { AtlasSectionHeader } from "../AtlasSectionHeader";
import { teamValues, whyChooseUs } from "../data";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Servicelink Facilities Management — our values, team, and commitment to quality facilities services across Sydney.",
};

export default function AtlasAboutPage() {
  return (
    <>
      <AtlasPageHero
        eyebrow="About us"
        title="A partner focused on safe, efficient environments"
        lead="ServiceLink Pty Ltd specialises in integrated facility management across commercial real estate, government, healthcare, education, and retail."
      />

      <section className="atlas-section bg-[#fffdf9]">
        <div className="atlas-container">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <div>
              <AtlasSectionHeader
                eyebrow="Why choose us"
                title="Experience you can rely on"
              />
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {whyChooseUs.map((item) => (
                  <article key={item.title} className="atlas-card rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-[#1c1917]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#57534e]">{item.text}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="lg:border-l lg:border-[#e7e0d4] lg:pl-16">
              <AtlasSectionHeader
                eyebrow="Quality service"
                title="Nationally recognised accreditation"
                lead="Triple ISO-certified with Conserve Certificate — leading in quality assurance and sustainability."
              />
              <ul className="mt-10 space-y-3">
                {site.certifications.map((item) => (
                  <li key={item} className="atlas-cert-badge">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-20 border-t border-[#e7e0d4] pt-16">
            <AtlasSectionHeader
              eyebrow="Our team"
              title="People who care about the details"
              center
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {teamValues.map((item, i) => (
                <article
                  key={item.title}
                  className="atlas-value-card rounded-2xl p-6 text-white"
                >
                  <span className="text-xs font-bold text-white/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
