import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

const PARENT_LINKS = [
  { href: "/panel", label: "Resumen" },
  { href: "/panel/pagos", label: "Pagos" },
  { href: "/panel/perfil", label: "Perfil" },
];

const ADMIN_LINKS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/inscripciones", label: "Inscripciones" },
  { href: "/admin/jugadores", label: "Alumnos" },
  { href: "/admin/pagos", label: "Pagos" },
  { href: "/admin/horarios", label: "Horarios" },
  { href: "/admin/galeria", label: "Galería" },
  { href: "/admin/mensajes", label: "Mensajes" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/contenido", label: "Contenido" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const links = profile.role === "admin" ? ADMIN_LINKS : PARENT_LINKS;
  const homeHref = profile.role === "admin" ? "/admin" : "/panel";

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <header className="border-b-2 border-brand-500 bg-ink-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-6">
            <Link href={homeHref} className="font-display text-sm font-bold uppercase tracking-wide text-white">
              Nexus<span className="text-brand-500">×</span>Football
            </Link>
            <nav className="flex flex-wrap items-center gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-white/70 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">
              {profile.full_name}{" "}
              <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs uppercase tracking-wide text-white/80">
                {profile.role === "admin" ? "Admin" : "Apoderado"}
              </span>
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
