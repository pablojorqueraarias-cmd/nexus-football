"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/programas", label: "Programas" },
  { href: "/horarios", label: "Horarios" },
  { href: "/galeria", label: "Galería" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader({
  logoAssets,
}: {
  logoAssets: { dark: string | null; light: string | null };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-900/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" onClick={() => setOpen(false)}>
          <Logo assets={logoAssets} />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold uppercase tracking-wide transition-colors hover:text-brand-500 ${
                pathname === link.href ? "text-brand-500" : "text-ink-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm font-semibold uppercase tracking-wide text-ink-900 hover:text-brand-500"
          >
            Ingresar
          </Link>
          <Link
            href="/inscripcion"
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-600"
          >
            Inscríbete
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-ink-900/15 md:hidden"
          aria-label="Abrir menú"
        >
          <span className="sr-only">Menú</span>
          <div className="flex flex-col gap-1">
            <span className="h-0.5 w-5 bg-ink-900" />
            <span className="h-0.5 w-5 bg-ink-900" />
            <span className="h-0.5 w-5 bg-ink-900" />
          </div>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-ink-900/10 bg-white px-4 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wide ${
                pathname === link.href ? "bg-brand-50 text-brand-600" : "text-ink-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wide text-ink-900"
          >
            Ingresar
          </Link>
          <Link
            href="/inscripcion"
            onClick={() => setOpen(false)}
            className="mt-1 rounded-md bg-brand-500 px-3 py-2 text-center text-sm font-bold uppercase tracking-wide text-white"
          >
            Inscríbete
          </Link>
        </nav>
      )}
    </header>
  );
}
