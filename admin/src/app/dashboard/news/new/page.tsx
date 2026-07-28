import Link from "next/link";
import { NewsPostForm } from "@/components/NewsPostForm";

export default function NewNewsPage() {
  return (
    <>
      <div className="admin-header">
        <div>
          <h1 style={{ margin: 0 }}>Add news post</h1>
          <p style={{ margin: "0.35rem 0 0", color: "#64748b", fontSize: "0.875rem" }}>
            Create a post for the public News page.
          </p>
        </div>
        <Link className="admin-btn admin-btn--ghost" href="/dashboard/news">
          Back to news
        </Link>
      </div>
      <NewsPostForm />
    </>
  );
}
