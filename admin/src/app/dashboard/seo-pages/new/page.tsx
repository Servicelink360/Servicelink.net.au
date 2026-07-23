import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { locations, seoServices } from "@/lib/db/schema";
import { SeoPageForm } from "../SeoPageForm";

export default async function NewSeoPage() {
  const db = getDb();
  const [cities, metros, services] = await Promise.all([
    db
      .select({ id: locations.id, name: locations.name, state: locations.state })
      .from(locations)
      .where(and(eq(locations.type, "city"), isNull(locations.parentId)))
      .orderBy(asc(locations.state), asc(locations.name)),
    db
      .select({ id: locations.id, name: locations.name, parentId: locations.parentId })
      .from(locations)
      .where(eq(locations.type, "metro"))
      .orderBy(asc(locations.sortOrder), asc(locations.name)),
    db
      .select({ id: seoServices.id, name: seoServices.name })
      .from(seoServices)
      .orderBy(asc(seoServices.sortOrder), asc(seoServices.name)),
  ]);

  return <SeoPageForm cities={cities} metros={metros} services={services} mode="create" />;
}
