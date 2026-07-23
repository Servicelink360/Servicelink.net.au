import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import {
  parseJsonBody,
  requireDatabase,
  validationErrorResponse,
} from "@/lib/api";
import { subscribeSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const dbCheck = requireDatabase();
  if (dbCheck) return dbCheck;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(parseJsonBody(body));
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { email, name, source } = parsed.data;
  const db = getDb();

  const [existing] = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.email, email))
    .limit(1);

  if (existing) {
    if (!existing.active) {
      await db
        .update(subscribers)
        .set({ active: true, name: name ?? existing.name, subscribedAt: new Date() })
        .where(eq(subscribers.email, email));
    }

    return NextResponse.json({
      message: "You are already subscribed to Servicelink updates.",
    });
  }

  await db.insert(subscribers).values({
    email,
    name: name ?? null,
    source: source ?? "website",
  });

  return NextResponse.json({
    message: "Thanks for subscribing. We will keep you posted on Servicelink news and updates.",
  });
}
