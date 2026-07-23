type LogoProps = {
  className?: string;
  variant?: "light" | "dark";
  src?: string;
};

export function Logo({
  className = "",
  variant = "dark",
  src = "/logo/servicelink_logo.svg",
}: LogoProps) {
  const lightClass = variant === "light" ? "brightness-0 invert" : "";

  return (
    <img
      src={src}
      alt="ServiceLink — Your Partner in Facilities"
      className={[lightClass, className].filter(Boolean).join(" ")}
    />
  );
}
