import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "What We Do",
  description:
    "Discover Servicelink's full range of facility management, cleaning, maintenance, gardening, and demolition services.",
  path: "/what-we-do",
});
const serviceAreas = [
  {
    title: "1. Facility Management",
    items: [
      "Preventive maintenance of building, plumbing, and electrical systems",
      "Space management and utilisation planning",
      "Waste management and recycling programs",
      "Cleaning and janitorial oversight",
      "Grounds and landscape management",
    ],
  },
  {
    title: "2. General Cleaning and Hygiene Services",
    items: [
      "Office, retail, and public amenities cleaning",
      "Event and stadium cleaning",
      "Aquatic centre specialist cleaning",
      "Library, childcare, and aged care sanitisation",
    ],
  },
  {
    title: "3. Roof and Gutter Cleaning and Maintenance",
    items: [
      "Roof cleaning and debris removal",
      "Gutter clearing and blockage prevention",
      "Inspections and repair coordination",
    ],
  },
  {
    title: "4. Gardening and Ground Maintenance",
    items: [
      "Tree lopping and pruning",
      "Arborist reporting",
      "Mowing, weeding, and landscaping",
    ],
  },
  {
    title: "5. Handyman and General Building Maintenance",
    items: [
      "General handyman and building repairs",
      "Stripping, sealing, painting, and carpentry",
      "Plumbing, electrical, and pest control coordination",
    ],
  },
  {
    title: "6. Demolition and Strip Out Services",
    items: [
      "Partial and full demolition",
      "Interior strip out and debris removal",
      "Salvage and recycling programs",
    ],
  },
];

export default function WhatWeDoPage() {
  return (
    <>
      <PageHero
        title="What We Do"
        description="Servicelink delivers end-to-end facilities services for councils, schools, commercial properties, and community assets."
      />

      <Section title="Servicelink services">
        <div className="grid gap-6">
          {serviceAreas.map((area) => (
            <article
              key={area.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-slate-900">{area.title}</h3>
              <ul className="mt-4 grid gap-2 md:grid-cols-2">
                {area.items.map((item) => (
                  <li key={item} className="text-sm leading-6 text-slate-600">
                    • {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
