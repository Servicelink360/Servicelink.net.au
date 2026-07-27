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

  const { name, email, phone, company, portfolioSize, message, source, referrer } =
    parsed.data;

  const fullMessage = referrer
    ? `Referred from: ${referrer}\n\n${message}`
    : message;

  const db = getDb();

  await db.insert(contactMessages).values({
    name,
    email,
    phone: phone || null,
    company: company || null,
    portfolioSize: portfolioSize || null,
    message: fullMessage,
    source: source ?? "website",
  });

  console.info("[contact] saved", {
    name,
    email,
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
      Portfolio: portfolioSize,
      Source: source ?? "website",
    },
  });

  return NextResponse.json({
    message: `Thank you, ${name}. Your enquiry has been received and will be reviewed by our team.`,
  });
}
