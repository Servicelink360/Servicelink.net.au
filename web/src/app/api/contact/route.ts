import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import {
  parseJsonBody,
  requireDatabase,
  validationErrorResponse,
} from "@/lib/api";
import { notifyContactSubmission } from "@/lib/email";
import { contactSchema } from "@/lib/validations";
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

  const parsed = contactSchema.safeParse(parseJsonBody(body));
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const {
    name,
    email,
    phone,
    company,
    subject,
    message,
    source,
    referrer,
    pagePath,
    landingPath,
    trafficReferrer,
    searchEngine,
  } = parsed.data;

  const fullMessage = referrer
    ? `Referred from: ${referrer}\n\n${message}`
    : message;

  const db = getDb();

  await db.insert(contactMessages).values({
    name,
    email,
    phone: phone || null,
    company: company || null,
    // Reuse portfolio_size column to store contact subject (no schema migration).
    portfolioSize: subject.slice(0, 32),
    message: fullMessage,
    source: source ?? "website",
    pagePath: pagePath || null,
    landingPath: landingPath || null,
    trafficReferrer: trafficReferrer || null,
    searchEngine: searchEngine || null,
  });

  console.info("[contact] saved", {
    name,
    email,
    subject,
    destination: site.contact.email,
  });

  await notifyContactSubmission({
    kind: "contact",
    name,
    email,
    phone,
    company,
    message: fullMessage,
    extra: {
      Subject: subject,
      Source: source ?? "website",
      Page: pagePath,
      "Landed on": landingPath,
      "Search engine": searchEngine,
      Referrer: trafficReferrer,
    },
  });

  return NextResponse.json({
    message: `Thank you, ${name}. Your enquiry has been received and will be reviewed by our team.`,
  });
}
