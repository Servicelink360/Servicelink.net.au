import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/LegalDocument";
import { getLegalPage, legalPages } from "@/lib/legal";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
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
  });}

export default async function LegalRoutePage({ params }: LegalRouteProps) {
  const { slug } = await params;
  const page = getLegalPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <>
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-6 text-sm text-slate-500 md:px-6">
          {site.name}
        </div>
      </div>
      <LegalDocument page={page} />
    </>
  );
}
