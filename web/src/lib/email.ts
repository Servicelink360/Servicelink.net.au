import { site } from "@/lib/site";

type EmailAddress = {
  email: string;
  name?: string;
};

type SendEmailInput = {
  to?: EmailAddress[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: EmailAddress;
  tags?: string[];
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function textToHtml(text: string): string {
  return `<pre style="font-family:Segoe UI,Arial,sans-serif;font-size:14px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(text)}</pre>`;
}

export function isBrevoConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY?.trim());
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[email] BREVO_API_KEY is not set — skipping send.");
    return false;
  }

  const senderEmail =
    process.env.BREVO_SENDER_EMAIL?.trim() || site.contact.email;
  const senderName =
    process.env.BREVO_SENDER_NAME?.trim() || site.name;
  const defaultTo =
    process.env.BREVO_TO_EMAIL?.trim() || site.contact.email;

  const to = input.to?.length
    ? input.to
    : [{ email: defaultTo, name: "Servicelink Helpdesk" }];

  const payload = {
    sender: { email: senderEmail, name: senderName },
    to,
    replyTo: input.replyTo,
    subject: input.subject,
    textContent: input.text,
    htmlContent: input.html ?? textToHtml(input.text),
    tags: input.tags,
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("[email] Brevo send failed", response.status, body);
    return false;
  }

  return true;
}

type ContactNotifyInput = {
  kind: "contact" | "quote";
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message: string;
  extra?: Record<string, string | null | undefined>;
};

export async function notifyContactSubmission(
  input: ContactNotifyInput,
): Promise<void> {
  if (!isBrevoConfigured()) return;

  const lines = [
    `New ${input.kind === "quote" ? "quote request" : "website enquiry"}`,
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    input.phone ? `Phone: ${input.phone}` : null,
    input.company ? `Company: ${input.company}` : null,
    ...Object.entries(input.extra ?? {})
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => `${key}: ${value}`),
    "",
    "Message:",
    input.message,
  ].filter((line): line is string => line !== null);

  const subject =
    input.kind === "quote"
      ? `Quote request from ${input.name}`
      : `Website enquiry from ${input.name}`;

  try {
    const sent = await sendEmail({
      subject,
      text: lines.join("\n"),
      replyTo: { email: input.email, name: input.name },
      tags: [input.kind, "website"],
    });

    if (sent) {
      console.info(`[email] ${input.kind} notification sent`, {
        to: process.env.BREVO_TO_EMAIL?.trim() || site.contact.email,
        from: input.email,
      });
    }
  } catch (error) {
    console.error(`[email] ${input.kind} notification error`, error);
  }
}
