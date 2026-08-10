import type { LegalPage } from "@/lib/legal";

type LegalDocumentProps = {
  page: LegalPage;
};

export function LegalDocument({ page }: LegalDocumentProps) {
  return (
    <article className="sl-container" style={{ paddingTop: "4rem", paddingBottom: "5rem", maxWidth: "48rem" }}>
      <p className="sl-kicker">Last updated: {page.lastUpdated}</p>
      <h1 className="sl-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginTop: "0.5rem" }}>
        {page.title}
      </h1>
      <p className="sl-lead" style={{ marginTop: "1rem" }}>
        {page.description}
      </p>

      <div style={{ marginTop: "3rem", display: "grid", gap: "2.5rem" }}>
        {page.sections.map((section) => (
          <section key={section.title}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--sl-ink)" }}>
              {section.title}
            </h2>
            <div style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--sl-muted)" }}>
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
