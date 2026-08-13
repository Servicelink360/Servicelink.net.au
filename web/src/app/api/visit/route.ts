import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { siteVisits } from "@/lib/db/schema";
import {
  parseJsonBody,
  requireDatabase,
  validationErrorResponse,
} from "@/lib/api";
import { visitSchema } from "@/lib/validations";

const BOT_UA =
  /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|lighthouse|headless|httpclient|monitor/i;

function isInternalPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("://");
}

export async function POST(request: Request) {
  const dbCheck = requireDatabase();
  if (dbCheck) return dbCheck;

  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || BOT_UA.test(userAgent)) {
    return NextResponse.json({ ok: true });
  }

  let body: unknown;
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      body = JSON.parse(await request.text());
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = visitSchema.safeParse(parseJsonBody(body));
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const pagePath = parsed.data.pagePath.split("#")[0] ?? parsed.data.pagePath;
  if (!isInternalPath(pagePath)) {
    return NextResponse.json({ ok: true });
  }

  await getDb().insert(siteVisits).values({
    sessionId: parsed.data.sessionId,
    path: pagePath.slice(0, 512),
    landingPath: parsed.data.landingPath?.slice(0, 512) || null,
    searchEngine: parsed.data.searchEngine || null,
    trafficReferrer: parsed.data.trafficReferrer?.slice(0, 512) || null,
  });

  return NextResponse.json({ ok: true });
}
