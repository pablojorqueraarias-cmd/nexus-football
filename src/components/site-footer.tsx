import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter({
  logoAssets,
}: {
  logoAssets: { dark: string | null; light: string | null };
}) {
  return (
    <footer className="bg-ink-900 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Logo assets={logoAssets} variant="light" withTagline />
          <p className="mt-4 max-w-xs text-sm text-white/60">
            Academia de fútbol formativo en Chile, con categorías desde Iniciación
            hasta Proyección.
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-brand-400">
            Navegación
          </h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <li><Link href="/programas" className="hover:text-white">Programas</Link></li>
            <li><Link href="/horarios" className="hover:text-white">Horarios</Link></li>
            <li><Link href="/galeria" className="hover:text-white">Galería</Link></li>
            <li><Link href="/inscripcion" className="hover:text-white">Inscripción</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-brand-400">
            Contacto
          </h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <li>Chile</li>
            <li>
              <Link href="/contacto" className="hover:text-white">
                Formulario de contacto
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white">
                Acceso padres / administración
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/40 sm:px-6">
        © {new Date().getFullYear()} Nexus Football. Todos los derechos reservados.
      </div>
    </footer>
  );
}
