import type { LegalPage } from "@/lib/legal";

type LegalDocumentProps = {
  page: LegalPage;
};

export function LegalDocument({ page }: LegalDocumentProps) {
  return (
    <article
      className="sl-container"
      style={{
        paddingTop: "6.5rem",
        paddingBottom: "5rem",
        maxWidth: "48rem",
      }}
    >
      <p
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--sl-accent, #1b7a4e)",
        }}
      >
        Last updated: {page.lastUpdated}
      </p>
      <h1
        style={{
          marginTop: "0.75rem",
          fontFamily: "var(--font-m1-serif), Georgia, serif",
          fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
          fontWeight: 600,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          color: "var(--sl-ink)",
        }}
      >
        {page.title}
      </h1>
      <p
        className="sl-lead"
        style={{ marginTop: "0.85rem", fontSize: "1.05rem" }}
      >
        {page.description}
      </p>

      <div style={{ marginTop: "2.75rem", display: "grid", gap: "2.25rem" }}>
        {page.sections.map((section) => (
          <section key={section.title}>
            <h2
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--sl-ink)",
              }}
            >
              {section.title}
            </h2>
            <div style={{ marginTop: "0.85rem", display: "grid", gap: "0.9rem" }}>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: 1.7,
                    color: "var(--sl-muted)",
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
