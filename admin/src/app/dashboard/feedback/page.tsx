import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import {
  CLIENT_FEEDBACK_SETTINGS_KEY,
  parseClientFeedbackSettings,
} from "@/lib/client-feedback";
import { ClientFeedbackManager } from "@/components/ClientFeedbackManager";

type FeedbackPageProps = {
  searchParams: Promise<{ saved?: string; edit?: string }>;
};

export default async function FeedbackPage({ searchParams }: FeedbackPageProps) {
  const params = await searchParams;
  const [row] = await getDb()
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, CLIENT_FEEDBACK_SETTINGS_KEY))
    .limit(1);

  const items = parseClientFeedbackSettings(row?.value);

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 style={{ margin: 0 }}>Client feedback</h1>
          <p style={{ margin: "0.35rem 0 0", color: "#64748b", fontSize: "0.875rem" }}>
            Manage homepage testimonials. Add as many as you need.
          </p>
        </div>
      </div>
      <div className="admin-panel" style={{ padding: "1.5rem" }}>
        <ClientFeedbackManager
          initialItems={items}
          startEditing={params.edit === "1"}
          saved={params.saved === "1"}
        />
      </div>
    </>
  );
}
