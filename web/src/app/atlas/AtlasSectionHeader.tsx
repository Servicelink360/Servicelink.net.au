type AtlasSectionHeaderProps = {
  eyebrow: string;
  title: string;
  lead?: string;
  center?: boolean;
  light?: boolean;
};

export function AtlasSectionHeader({
  eyebrow,
  title,
  lead,
  center = false,
  light = false,
}: AtlasSectionHeaderProps) {
  return (
    <header
      className={`atlas-section-header ${center ? "atlas-section-header--center" : ""}`}
    >
      <p className={`atlas-eyebrow ${light ? "atlas-eyebrow--light" : ""}`}>{eyebrow}</p>
      <div className={center ? "" : "atlas-section-rule"}>
        <h2 className={`atlas-section-title ${light ? "text-white" : ""}`}>{title}</h2>
      </div>
      {lead ? (
        <p className={`atlas-section-lead ${light ? "text-white/75" : ""}`}>{lead}</p>
      ) : null}
    </header>
  );
}
