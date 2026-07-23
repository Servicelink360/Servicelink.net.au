import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isDatabaseConfigured } from "@/lib/db";

export function databaseUnavailableResponse() {
  return NextResponse.json(
    { error: "Database is not configured. Set DATABASE_URL and run migrations." },
    { status: 503 },
  );
}

export function requireDatabase() {
  if (!isDatabaseConfigured()) {
    return databaseUnavailableResponse();
  }
  return null;
}

export function validationErrorResponse(error: ZodError) {
  const message = error.issues[0]?.message ?? "Invalid request.";
  return NextResponse.json({ error: message }, { status: 400 });
}

export function parseJsonBody<T>(body: unknown): T | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  return body as T;
}
