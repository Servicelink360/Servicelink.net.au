import type { LegalPage } from "@/lib/legal";

type LegalDocumentProps = {
  page: LegalPage;
};

export function LegalDocument({ page }: LegalDocumentProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <p className="text-sm font-medium text-emerald-700">
        Last updated: {page.lastUpdated}
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
        {page.title}
      </h1>
      <p className="mt-4 text-lg leading-8 text-slate-600">{page.description}</p>

      <div className="mt-12 space-y-10">
        {page.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
            <div className="mt-4 space-y-4">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-slate-600">
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
