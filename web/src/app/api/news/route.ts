import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { newsPosts } from "@/lib/db/schema";
import { requireDatabase } from "@/lib/api";

export async function GET() {
  const dbCheck = requireDatabase();
  if (dbCheck) return dbCheck;

  const db = getDb();

  const posts = await db
    .select({
      id: newsPosts.id,
      title: newsPosts.title,
      slug: newsPosts.slug,
      summary: newsPosts.summary,
      publishedAt: newsPosts.publishedAt,
    })
    .from(newsPosts)
    .where(eq(newsPosts.published, true))
    .orderBy(desc(newsPosts.publishedAt));

  return NextResponse.json({ posts });
}
