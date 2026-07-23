import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { createPageMetadata } from "@/lib/seo";
import { getServiceImage } from "@/site/data";
import { SiteNav } from "@/site/SiteNav";
import { SiteFooter } from "@/site/SiteFooter";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { newsPosts } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "News & Updates",
  description: "Latest news and updates from Servicelink facilities management.",
  path: "/news",
});
export default async function NewsPage() {
  const posts = isDatabaseConfigured()
    ? await getDb()
        .select({
          title: newsPosts.title,
          slug: newsPosts.slug,
          summary: newsPosts.summary,
          publishedAt: newsPosts.publishedAt,
        })
        .from(newsPosts)
        .where(eq(newsPosts.published, true))
        .orderBy(desc(newsPosts.publishedAt))
    : [];

  return (
    <>
      <SiteNav />

      <section className="m1-service-hero">
        <div className="m1-wrap m1-service-hero__grid">
          <div className="m1-service-hero__copy">
            <nav className="m1-service-hero__crumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden>/</span>
              <span>News</span>
            </nav>

            <p className="m1-label">News &amp; updates</p>
            <h1 className="m1-h1 m1-service-hero__title">
              The latest from
              <br />
              <em>Servicelink.</em>
            </h1>
            <p className="m1-service-hero__summary">
              The latest from Servicelink on facilities management, service
              delivery, and operational excellence across Sydney and NSW.
            </p>

            <div className="m1-service-hero__actions">
              <Link href="/join" className="m1-btn m1-btn--ink m1-btn--lg">
                Join for updates
              </Link>
              <Link href="/contact" className="m1-btn m1-btn--line m1-btn--lg">
                Get in touch
              </Link>
            </div>
          </div>

          <div className="m1-service-hero__visual">
            <div className="m1-service-hero__frame">
              <Image
                src={getServiceImage("support-services")}
                alt="Servicelink team delivering facilities management services across NSW"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="m1-service-hero__badge">
              <span className="m1-service-hero__badge-n">
                {posts.length > 0 ? posts.length : "18"}
              </span>
              <span className="m1-service-hero__badge-l">
                {posts.length > 0 ? "Published articles" : "Years of service"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="m1-section m1-section--stone">
        <div className="m1-wrap">
          <div className="m1-section-top">
            <p className="m1-label">Recent posts</p>
            <h2 className="m1-h2">All updates</h2>
          </div>

          {!isDatabaseConfigured() ? (
            <p className="m1-join__lead">
              News will appear here once the database is connected.
            </p>
          ) : posts.length === 0 ? (
            <p className="m1-join__lead">No published updates yet. Check back soon.</p>
          ) : (
            <ul className="m1-news-list">
              {posts.map((post) => (
                <li key={post.slug} className="m1-news-item">
                  <p className="m1-news-item__date">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : null}
                  </p>
                  <h2 className="m1-news-item__title">
                    <Link href={`/news/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="m1-news-item__summary">{post.summary}</p>
                </li>
              ))}
            </ul>
          )}

          <p className="m1-join__meta">
            Want updates by email?{" "}
            <Link href="/join" className="m1-join__link">
              Join Servicelink
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="sl-page m1-bottom">
        <SiteFooter />
      </div>
    </>
  );
}
