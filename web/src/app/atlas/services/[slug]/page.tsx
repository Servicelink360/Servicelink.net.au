import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getService, services } from "@/lib/services";
import { serviceImages } from "../../data";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service not found" };
  return { title: service.title, description: service.summary };
}

export default async function AtlasServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      <section className="border-b border-[#e7e0d4] bg-[#fffdf9]">
        <div className="atlas-container grid items-center gap-10 py-12 md:grid-cols-2 md:py-16">
          <div>
            <p className="atlas-eyebrow">Service</p>
            <h1 className="atlas-serif mt-3 text-4xl text-[#1c1917] md:text-5xl">
              {service.title}
            </h1>
            <p className="mt-4 text-lg text-[#57534e]">{service.summary}</p>
            <Link
              href="/atlas/contact"
              className="atlas-btn-primary mt-8 inline-flex rounded-full px-6 py-3 text-sm font-semibold"
            >
              Request a quote
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-[#e7e0d4]">
            <Image
              src={serviceImages[service.slug] ?? "/images/figure1.png"}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="atlas-section">
        <div className="atlas-container max-w-3xl">
          <p className="text-base leading-relaxed text-[#57534e]">{service.description}</p>
          <h2 className="atlas-serif mt-10 text-2xl text-[#1c1917]">Key capabilities</h2>
          <ul className="mt-6 space-y-3">
            {service.highlights.map((item) => (
              <li key={item.title} className="atlas-cert-badge">
                {item.title}
              </li>
            ))}
          </ul>
          <Link
            href="/atlas/services"
            className="mt-10 inline-flex text-sm font-semibold text-[#3f5c47] hover:text-[#b85c38]"
          >
            ← All services
          </Link>
        </div>
      </section>
    </>
  );
}
