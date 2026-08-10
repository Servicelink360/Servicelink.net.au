import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/LegalDocument";
import { getLegalPage, legalPages } from "@/lib/legal";
import { createPageMetadata } from "@/lib/seo";
import { SiteFooter } from "@/site/SiteFooter";
import { SiteNav } from "@/site/SiteNav";

type LegalRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return legalPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: LegalRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getLegalPage(slug);

  if (!page) {
    return { title: "Page not found" };
  }

  return createPageMetadata({
    title: page.title,
    description: page.description,
    path: `/legal/${page.slug}`,
  });
}

export default async function LegalRoutePage({ params }: LegalRouteProps) {
  const { slug } = await params;
  const page = getLegalPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <>
      <SiteNav />
      <main>
        <LegalDocument page={page} />
      </main>
      <div className="sl-page m1-bottom">
        <SiteFooter />
      </div>
    </>
  );
}
