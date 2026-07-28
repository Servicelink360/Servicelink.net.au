import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { NewsPostForm } from "@/components/NewsPostForm";
import { getDb } from "@/lib/db";
import { newsPosts } from "@/lib/db/schema";

type EditNewsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditNewsPage({ params }: EditNewsPageProps) {
  const { id } = await params;
  const [post] = await getDb().select().from(newsPosts).where(eq(newsPosts.id, id)).limit(1);

  if (!post) notFound();

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 style={{ margin: 0 }}>Edit news post</h1>
          <p style={{ margin: "0.35rem 0 0", color: "#64748b", fontSize: "0.875rem" }}>
            Update title, content, image, SEO and publish status.
          </p>
        </div>
        <Link className="admin-btn admin-btn--ghost" href="/dashboard/news">
          Back to news
        </Link>
      </div>
      <NewsPostForm post={post} />
    </>
  );
}
