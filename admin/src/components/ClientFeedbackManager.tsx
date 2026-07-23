"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveClientFeedback } from "@/lib/actions";
import {
  createClientFeedbackId,
  type ClientFeedbackItem,
} from "@/lib/client-feedback";

type ClientFeedbackManagerProps = {
  initialItems: ClientFeedbackItem[];
  startEditing?: boolean;
  saved?: boolean;
};

function emptyItem(): ClientFeedbackItem {
  return {
    id: createClientFeedbackId(),
    quote: "",
    name: "",
    org: "",
    published: true,
  };
}

export function ClientFeedbackManager({
  initialItems,
  startEditing = false,
  saved = false,
}: ClientFeedbackManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(startEditing);
  const [showSuccess, setShowSuccess] = useState(saved);
  const [items, setItems] = useState<ClientFeedbackItem[]>(
    initialItems.length > 0 ? initialItems : [emptyItem()],
  );

  const feedbackJson = useMemo(() => JSON.stringify(items), [items]);

  useEffect(() => {
    if (!saved) return;
    setShowSuccess(true);
    setEditing(false);
    router.replace("/dashboard/feedback");
  }, [saved, router]);

  useEffect(() => {
    if (!showSuccess) return;
    const timer = window.setTimeout(() => setShowSuccess(false), 4000);
    return () => window.clearTimeout(timer);
  }, [showSuccess]);

  function openEditor(withNew = false) {
    setItems(
      withNew
        ? [...(initialItems.length ? initialItems : []), emptyItem()]
        : initialItems.length > 0
          ? initialItems
          : [emptyItem()],
    );
    setEditing(true);
    setShowSuccess(false);
  }

  function closeEditor() {
    setItems(initialItems.length > 0 ? initialItems : [emptyItem()]);
    setEditing(false);
  }

  function updateItem(
    id: string,
    patch: Partial<Pick<ClientFeedbackItem, "quote" | "name" | "org" | "published">>,
  ) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    setItems((current) => [...current, emptyItem()]);
  }

  function removeItem(id: string) {
    setItems((current) => {
      const next = current.filter((item) => item.id !== id);
      return next.length > 0 ? next : [emptyItem()];
    });
  }

  function moveItem(id: string, direction: -1 | 1) {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      const [row] = next.splice(index, 1);
      next.splice(target, 0, row);
      return next;
    });
  }

  return (
    <div>
      {showSuccess ? (
        <div className="admin-notice admin-notice--success" role="status">
          Feedback saved successfully.
        </div>
      ) : null}

      {!editing ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              alignItems: "center",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem", lineHeight: 1.5 }}>
              These quotes appear on the homepage between stats and FAQ.
            </p>
            <div className="admin-actions">
              <button
                className="admin-btn admin-btn--ghost"
                type="button"
                onClick={() => openEditor(true)}
              >
                Add feedback
              </button>
              <button className="admin-btn" type="button" onClick={() => openEditor(false)}>
                Edit feedback
              </button>
            </div>
          </div>

          {initialItems.length === 0 ? (
            <p style={{ margin: 0, color: "#64748b" }}>No feedback quotes yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "0.85rem" }}>
              {initialItems.map((item, index) => (
                <article
                  key={item.id}
                  className="admin-panel"
                  style={{
                    padding: "1rem 1.15rem",
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      marginBottom: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <strong>Quote {index + 1}</strong>
                    <span
                      className={`admin-badge ${item.published ? "admin-badge--live" : ""}`}
                    >
                      {item.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.55 }}>&ldquo;{item.quote}&rdquo;</p>
                  <p style={{ margin: "0.65rem 0 0", color: "#64748b", fontSize: "0.875rem" }}>
                    {[item.name, item.org].filter(Boolean).join(" · ") || "—"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </>
      ) : (
        <form className="admin-form" action={saveClientFeedback}>
          <input type="hidden" name="feedbackJson" value={feedbackJson} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              alignItems: "center",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem", lineHeight: 1.5 }}>
              Edit quotes below, then save. Unpublished quotes stay hidden on the site.
            </p>
            <div className="admin-actions">
              <button className="admin-btn admin-btn--ghost" type="button" onClick={addItem}>
                Add feedback
              </button>
              <button className="admin-btn admin-btn--ghost" type="button" onClick={closeEditor}>
                Cancel
              </button>
            </div>
          </div>

          {items.map((item, index) => (
            <div
              key={item.id}
              className="admin-panel"
              style={{
                padding: "1.25rem",
                marginBottom: "1rem",
                border: "1px solid #e2e8f0",
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  alignItems: "center",
                  marginBottom: "0.85rem",
                  flexWrap: "wrap",
                }}
              >
                <strong>Quote {index + 1}</strong>
                <div className="admin-actions">
                  <button
                    className="admin-btn admin-btn--ghost admin-btn--small"
                    type="button"
                    onClick={() => moveItem(item.id, -1)}
                    disabled={index === 0}
                  >
                    Up
                  </button>
                  <button
                    className="admin-btn admin-btn--ghost admin-btn--small"
                    type="button"
                    onClick={() => moveItem(item.id, 1)}
                    disabled={index === items.length - 1}
                  >
                    Down
                  </button>
                  <button
                    className="admin-btn admin-btn--danger admin-btn--small"
                    type="button"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="admin-field">
                <label htmlFor={`quote-${item.id}`}>Quote</label>
                <textarea
                  id={`quote-${item.id}`}
                  rows={3}
                  value={item.quote}
                  onChange={(event) => updateItem(item.id, { quote: event.target.value })}
                />
              </div>
              <div className="admin-field">
                <label htmlFor={`name-${item.id}`}>Name / role</label>
                <input
                  id={`name-${item.id}`}
                  value={item.name}
                  onChange={(event) => updateItem(item.id, { name: event.target.value })}
                  placeholder="e.g. Facilities Manager"
                />
              </div>
              <div className="admin-field">
                <label htmlFor={`org-${item.id}`}>Organisation</label>
                <input
                  id={`org-${item.id}`}
                  value={item.org}
                  onChange={(event) => updateItem(item.id, { org: event.target.value })}
                  placeholder="e.g. Education portfolio, NSW"
                />
              </div>
              <label>
                <input
                  type="checkbox"
                  checked={item.published}
                  onChange={(event) =>
                    updateItem(item.id, { published: event.target.checked })
                  }
                />{" "}
                Published
              </label>
            </div>
          ))}

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button className="admin-btn" type="submit">
              Save feedback
            </button>
            <button className="admin-btn admin-btn--ghost" type="button" onClick={closeEditor}>
              Cancel
            </button>
            <Link className="admin-btn admin-btn--ghost" href="/dashboard">
              Back to dashboard
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
