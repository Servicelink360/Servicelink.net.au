import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { locations } from "@/lib/db/schema";
import { assertInternalImageUrl } from "@/lib/image-url";

export async function POST(request: Request) {
  try {
    await requireAdminSession();

    const body = (await request.json()) as {
      cityId?: string;
      metroId?: string | null;
      heroImage?: string | null;
    };

    const cityId = String(body.cityId ?? "").trim();
    const metroId = body.metroId ? String(body.metroId).trim() : null;
    const rawHero = body.heroImage;

    if (!cityId) {
      return NextResponse.json({ error: "City is required." }, { status: 400 });
    }

    const heroImage =
      rawHero === null || rawHero === undefined || String(rawHero).trim() === ""
        ? null
        : assertInternalImageUrl(String(rawHero), "Hero image");

    const db = getDb();

    if (metroId) {
      const [metro] = await db
        .select({ id: locations.id, slug: locations.slug, parentId: locations.parentId })
        .from(locations)
        .where(and(eq(locations.id, metroId), eq(locations.type, "metro")))
        .limit(1);

      if (!metro || metro.parentId !== cityId) {
        return NextResponse.json({ error: "Metro not found." }, { status: 404 });
      }

      await db.update(locations).set({ heroImage }).where(eq(locations.id, metroId));

      const [city] = await db
        .select({ slug: locations.slug })
        .from(locations)
        .where(eq(locations.id, cityId))
        .limit(1);

      if (city) {
        revalidatePath(`/locations/${city.slug}/${metro.slug}`);
        revalidatePath("/locations");
      }
    } else {
      const [city] = await db
        .select({ id: locations.id, slug: locations.slug })
        .from(locations)
        .where(and(eq(locations.id, cityId), eq(locations.type, "city")))
        .limit(1);

      if (!city) {
        return NextResponse.json({ error: "City not found." }, { status: 404 });
      }

      await db.update(locations).set({ heroImage }).where(eq(locations.id, cityId));
      revalidatePath(`/locations/${city.slug}`);
      revalidatePath("/locations");
    }

    revalidatePath("/dashboard/locations");
    revalidatePath(`/dashboard/locations/${cityId}`);
    if (metroId) {
      revalidatePath(`/dashboard/locations/${cityId}/metros/${metroId}`);
    }

    return NextResponse.json({ ok: true, heroImage });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Save failed.";
    const status = message.includes("Unauthorized") ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
