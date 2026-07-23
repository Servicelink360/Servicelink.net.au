export const CLIENT_FEEDBACK_SETTINGS_KEY = "client_feedback";

export type ClientFeedbackItem = {
  id: string;
  quote: string;
  name: string;
  org: string;
  published: boolean;
};

export const defaultClientFeedback: ClientFeedbackItem[] = [
  {
    id: "default-1",
    quote:
      "We finally have one partner who owns the outcome across our sites — not a chain of subcontractors passing the blame. Issues get raised, tracked and closed with evidence.",
    name: "Facilities Manager",
    org: "Education portfolio, NSW",
    published: true,
  },
  {
    id: "default-2",
    quote:
      "Service360 changed how we manage day-to-day work. We can see requests, faults and completed jobs in real time instead of chasing email threads.",
    name: "Property Operations Lead",
    org: "Commercial portfolio, Sydney",
    published: true,
  },
  {
    id: "default-3",
    quote:
      "Responsive teams, clear reporting and consistent standards across multiple community facilities. That reliability is what we need from a facilities partner.",
    name: "Assets Coordinator",
    org: "Local government, Greater Sydney",
    published: true,
  },
];

export function createClientFeedbackId(): string {
  return `fb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeClientFeedback(value: unknown): ClientFeedbackItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Partial<ClientFeedbackItem>;
      const quote = String(row.quote ?? "").trim();
      if (!quote) return null;
      return {
        id: String(row.id ?? "").trim() || createClientFeedbackId(),
        quote,
        name: String(row.name ?? "").trim(),
        org: String(row.org ?? "").trim(),
        published: row.published !== false,
      };
    })
    .filter((item): item is ClientFeedbackItem => Boolean(item));
}

export function parseClientFeedbackSettings(
  raw: string | null | undefined,
): ClientFeedbackItem[] {
  if (!raw?.trim()) return defaultClientFeedback;

  try {
    return normalizeClientFeedback(JSON.parse(raw));
  } catch {
    return defaultClientFeedback;
  }
}
