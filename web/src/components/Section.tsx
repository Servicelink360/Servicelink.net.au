type SectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function Section({
  eyebrow,
  title,
  description,
  children,
  className = "",
}: SectionProps) {
  return (
    <section className={`py-16 md:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            {description}
          </p>
        ) : null}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
