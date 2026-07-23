import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { createPageMetadata } from "@/lib/seo";
import { resolveLocationPageImages } from "@/lib/location-images";
import {
  getLinkedSeoPages,
  getPublishedSeoPagePaths,
  getSeoPageByPath,
} from "@/lib/seo-content";

export const dynamic = "force-dynamic";

type LocationPageProps = {
  params: Promise<{ path: string[] }>;
};

export async function generateStaticParams() {
  try {
    const pages = await getPublishedSeoPagePaths();
    return pages.map(({ path }) => ({ path: path.split("/") }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: LocationPageProps): Promise<Metadata> {
  const { path } = await params;
  const page = await getSeoPageByPath(path.join("/"));

  if (!page) {
    return { title: "Location not found" };
  }

  return createPageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/locations/${page.path}`,
    noIndex: page.noIndex,
  });
}

export default async function DynamicLocationPage({ params }: LocationPageProps) {
  const { path } = await params;
  const page = await getSeoPageByPath(path.join("/"));

  if (!page) {
    notFound();
  }

  const linked = await getLinkedSeoPages(page);
  const images = await resolveLocationPageImages(page);

  return <SeoLandingPage page={page} linked={linked} images={images} />;
}
