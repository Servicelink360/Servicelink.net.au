import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { createPageMetadata, getArticleJsonLd, getBreadcrumbJsonLd } from "@/lib/seo";
import { getNewsPostBySlug, getPublishedNewsSlugs } from "@/lib/seo-content";
import { SiteFooter } from "@/site/SiteFooter";
import { SiteNav } from "@/site/SiteNav";

type NewsArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const posts = await getPublishedNewsSlugs();
    return posts.map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);

  if (!post) {
    return { title: "Article not found" };
  }

  return createPageMetadata({
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.summary,
    path: `/news/${post.slug}`,
    openGraphType: "article",
  });
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publishedLabel = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      <JsonLd
        data={[
          getArticleJsonLd({
            title: post.title,
            description: post.metaDescription ?? post.summary,
            slug: post.slug,
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
            image: post.featuredImage,
          }),
          getBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
            { name: post.title, path: `/news/${post.slug}` },
          ]),
        ]}
      />
      <SiteNav />

      <article className="m1-section">
        <div className="m1-wrap">
          <nav className="m1-service-hero__crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden> / </span>
            <Link href="/news">News</Link>
            <span aria-hidden> / </span>
            <span>{post.title}</span>
          </nav>

          {publishedLabel ? (
            <p className="m1-news-item__date">{publishedLabel}</p>
          ) : null}
          <h1 className="m1-h2">{post.title}</h1>
          <p className="m1-join__lead">{post.summary}</p>

          <div className="m1-service-overview__body">
            {post.body.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>

          <p className="m1-join__meta">
            <Link href="/news" className="m1-join__link">
              ← Back to all news
            </Link>
          </p>
        </div>
      </article>

      <div className="sl-page m1-bottom">
        <SiteFooter />
      </div>
    </>
  );
}
