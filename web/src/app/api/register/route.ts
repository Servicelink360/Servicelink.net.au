import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { subscribers, users } from "@/lib/db/schema";
import {
  parseJsonBody,
  requireDatabase,
  validationErrorResponse,
} from "@/lib/api";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const dbCheck = requireDatabase();
  if (dbCheck) return dbCheck;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(parseJsonBody(body));
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { name, email, password, subscribeToUpdates, source } = parsed.data;
  const db = getDb();

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
    })
    .returning({ id: users.id, name: users.name, email: users.email });

  if (subscribeToUpdates) {
    const [existingSubscriber] = await db
      .select({ id: subscribers.id })
      .from(subscribers)
      .where(eq(subscribers.email, email))
      .limit(1);

    if (existingSubscriber) {
      await db
        .update(subscribers)
        .set({ active: true, userId: user.id, name })
        .where(eq(subscribers.email, email));
    } else {
      await db.insert(subscribers).values({
        email,
        name,
        userId: user.id,
        source: source ?? "register",
      });
    }
  }

  return NextResponse.json({
    message: `Welcome, ${user.name}. Your account has been created.`,
    user: { id: user.id, name: user.name, email: user.email },
  });
}
