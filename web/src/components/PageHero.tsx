type PageHeroProps = {
  title: string;
  description?: string;
};

export function PageHero({ title, description }: PageHeroProps) {
  return (
    <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
