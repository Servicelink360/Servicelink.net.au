import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import {
  CLIENT_FEEDBACK_SETTINGS_KEY,
  parseClientFeedbackSettings,
  type ClientFeedbackItem,
} from "@/lib/client-feedback";

export async function getClientFeedbackItems(): Promise<ClientFeedbackItem[]> {
  try {
    const [row] = await getDb()
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, CLIENT_FEEDBACK_SETTINGS_KEY))
      .limit(1);

    return parseClientFeedbackSettings(row?.value);
  } catch {
    return parseClientFeedbackSettings(null);
  }
}

export async function getPublishedClientFeedback(): Promise<ClientFeedbackItem[]> {
  const items = await getClientFeedbackItems();
  return items.filter((item) => item.published && item.quote.trim());
}
