import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import {
  parseJsonBody,
  requireDatabase,
  validationErrorResponse,
} from "@/lib/api";
import { notifyContactSubmission } from "@/lib/email";
import { quoteSchema } from "@/lib/validations";
import { site } from "@/lib/site";

export async function POST(request: Request) {
  const dbCheck = requireDatabase();
  if (dbCheck) return dbCheck;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = quoteSchema.safeParse(parseJsonBody(body));
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const {
    name,
    email,
    phone,
    company,
    service,
    location,
    portfolioSize,
    timeframe,
    message,
    source,
    locationPage,
    pagePath,
    landingPath,
    trafficReferrer,
    searchEngine,
  } = parsed.data;

  const details = [
    `Quote request — ${service}`,
    `Site location: ${location}`,
    locationPage ? `Location page: ${locationPage}` : null,
    timeframe ? `Timeframe: ${timeframe}` : null,
    portfolioSize ? `Portfolio: ${portfolioSize}` : null,
    "",
    message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const db = getDb();

  await db.insert(contactMessages).values({
    name,
    email,
    phone,
    company: company || null,
    portfolioSize: portfolioSize || null,
    message: details,
    source: source ?? "quote",
    pagePath: pagePath || locationPage || null,
    landingPath: landingPath || null,
    trafficReferrer: trafficReferrer || null,
    searchEngine: searchEngine || null,
  });

  console.info("[quote] saved", {
    name,
    email,
    service,
    destination: site.contact.email,
  });

  await notifyContactSubmission({
    kind: "quote",
    name,
    email,
    phone,
    company,
    message: details,
    extra: {
      Service: service,
      Location: location,
      Timeframe: timeframe,
      Portfolio: portfolioSize,
      Source: source ?? "quote",
      Page: pagePath || locationPage,
      "Landed on": landingPath,
      "Search engine": searchEngine,
      Referrer: trafficReferrer,
    },
  });

  return NextResponse.json({
    message: `Thank you, ${name}. Your quote request has been received and our team will be in touch shortly.`,
  });
}
