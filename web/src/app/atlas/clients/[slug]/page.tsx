import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { clients, getClient } from "@/lib/clients";

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
  if (!client) return { title: "Client not found" };
  return { title: client.title, description: client.summary };
}

export default async function AtlasClientDetailPage({ params }: ClientPageProps) {
  const { slug } = await params;
  const client = getClient(slug);

  if (!client) {
    notFound();
  }

  return (
    <>
      <section className="border-b border-[#e7e0d4] bg-[#fffdf9]">
        <div className="atlas-container py-12 md:py-16">
          <p className="atlas-eyebrow">Client</p>
          <h1 className="atlas-serif mt-3 text-4xl text-[#1c1917] md:text-5xl">
            {client.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[#57534e]">{client.summary}</p>
        </div>
      </section>

      <section className="atlas-section">
        <div className="atlas-container max-w-3xl">
          <h2 className="atlas-serif text-2xl text-[#1c1917]">Partnership overview</h2>
          <p className="mt-4 text-base leading-relaxed text-[#57534e]">
            {client.description}
          </p>

          <h2 className="atlas-serif mt-12 text-2xl text-[#1c1917]">Our current projects</h2>
          <p className="mt-2 text-sm text-[#57534e]">
            Facility projects we proudly manage for {client.title}.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {client.projects.map((project) => (
              <li key={project} className="atlas-card rounded-xl px-5 py-4 text-sm text-[#57534e]">
                {project}
              </li>
            ))}
          </ul>

          <Link
            href="/atlas/clients"
            className="mt-10 inline-flex text-sm font-semibold text-[#3f5c47] hover:text-[#b85c38]"
          >
            ← All clients
          </Link>
        </div>
      </section>
    </>
  );
}
