import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { clients, clientsOverview } from "@/lib/clients";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Our Clients",
  description: clientsOverview.description,
  path: "/clients",
});
export default function ClientsPage() {
  return (
    <>
      <PageHero
        title={clientsOverview.title}
        description={clientsOverview.description}
      />

      <Section eyebrow="We are proud to work with" title="Government and council partners">
        <div className="grid gap-6 md:grid-cols-2">
          {clients.map((client) => (
            <article
              key={client.slug}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-slate-900">{client.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{client.summary}</p>
              <Link
                href={`/clients/${client.slug}`}
                className="mt-5 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-600"
              >
                View client profile →
              </Link>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
