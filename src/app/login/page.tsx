import Link from "next/link";
import { Logo } from "@/components/logo";
import { getLogoAssets } from "@/lib/has-logo";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const logoAssets = getLogoAssets();

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-ink-900 px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--color-brand-700)_0%,transparent_45%),radial-gradient(circle_at_85%_75%,var(--color-brand-900)_0%,transparent_50%)]"
      />

      <div className="relative flex w-full max-w-sm flex-col items-center">
        <Link href="/" className="mb-6 flex flex-col items-center">
          <Logo assets={logoAssets} variant="light" />
        </Link>

        <LoginForm />
      </div>
    </div>
  );
}
