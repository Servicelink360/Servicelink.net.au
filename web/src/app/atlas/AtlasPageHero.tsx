type AtlasPageHeroProps = {
  eyebrow: string;
  title: string;
  lead?: string;
};

export function AtlasPageHero({ eyebrow, title, lead }: AtlasPageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#e7e0d4] bg-[#fffdf9] px-5 py-16 md:py-20">
      <div className="atlas-blob left-[-8%] top-0 h-48 w-48 bg-[#b85c38]/12" aria-hidden />
      <div className="atlas-blob right-[-5%] top-8 h-64 w-64 bg-[#3f5c47]/10" aria-hidden />
      <div className="atlas-container relative text-center">
        <p className="atlas-eyebrow">{eyebrow}</p>
        <h1 className="atlas-serif mx-auto mt-4 max-w-3xl text-4xl leading-tight tracking-tight text-[#1c1917] md:text-5xl">
          {title}
        </h1>
        {lead ? (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#57534e] md:text-lg">
            {lead}
          </p>
        ) : null}
      </div>
    </section>
  );
}
