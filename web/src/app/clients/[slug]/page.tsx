import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { clients, getClient } from "@/lib/clients";
import { createPageMetadata } from "@/lib/seo";
type ClientPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return clients.map((client) => ({ slug: client.slug }));
}

export async function generateMetadata({
  params,
}: ClientPageProps): Promise<Metadata> {
  const { slug } = await params;
  const client = getClient(slug);

  if (!client) {
    return { title: "Client not found" };
  }

  return createPageMetadata({
    title: client.title,
    description: client.summary,
    path: `/clients/${client.slug}`,
  });}

export default async function ClientDetailPage({ params }: ClientPageProps) {
  const { slug } = await params;
  const client = getClient(slug);

  if (!client) {
    notFound();
  }

  return (
    <>
      <PageHero title={client.title} description={client.summary} />

      <Section title="Partnership overview">
        <p className="max-w-3xl text-lg leading-8 text-slate-600">
          {client.description}
        </p>
      </Section>

      <Section title="Our current projects" className="bg-slate-50">
        <p className="mb-6 text-sm text-slate-600">
          Below are some of the facility projects we proudly manage for {client.title}.
        </p>
        <ul className="grid gap-3 md:grid-cols-2">
          {client.projects.map((project) => (
            <li
              key={project}
              className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700"
            >
              {project}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
