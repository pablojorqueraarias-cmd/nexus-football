import Image from "next/image";

export function Logo({
  assets = { dark: null, light: null },
  withTagline = false,
  variant = "dark",
  className = "",
}: {
  assets?: { dark: string | null; light: string | null };
  withTagline?: boolean;
  variant?: "dark" | "light";
  className?: string;
}) {
  // No se usa la imagen del otro contraste como respaldo: un logo de texto
  // blanco sobre un fondo blanco (o negro sobre negro) sería invisible.
  const src = variant === "light" ? assets.light : assets.dark;

  if (src) {
    return (
      <div className={`flex flex-col items-start gap-1 ${className}`}>
        <Image
          src={src}
          alt="Nexus Football"
          width={220}
          height={70}
          priority
          className="h-auto w-44 object-contain"
        />
        {withTagline && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-500">
            Pasión · Jerarquía · Actitud
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      <span
        className={`font-display text-2xl font-bold uppercase tracking-wider ${
          variant === "light" ? "text-white" : "text-ink-900"
        }`}
      >
        <span className="text-brand-500">Nexus</span>Football
      </span>
      {withTagline && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-500">
          Pasión · Jerarquía · Actitud
        </p>
      )}
    </div>
  );
}
