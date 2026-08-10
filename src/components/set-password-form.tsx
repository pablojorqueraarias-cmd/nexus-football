"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function establishSession() {
      const supabase = createClient();

      // Flujo con tokens en el hash de la URL (#access_token=...).
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        window.history.replaceState(null, "", window.location.pathname);
        setSessionReady(!error);
        setChecking(false);
        return;
      }

      // Flujo con código en la URL (?code=...).
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        setSessionReady(!error);
        setChecking(false);
        return;
      }

      // Ya había una sesión activa.
      const { data } = await supabase.auth.getSession();
      setSessionReady(!!data.session);
      setChecking(false);
    }

    establishSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("No se pudo guardar la contraseña. Pide que te reenvíen la invitación.");
      setLoading(false);
      return;
    }

    router.push("/panel");
    router.refresh();
  }

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white p-8 shadow-2xl">
      <h2 className="mb-1 text-lg font-semibold text-ink-900">Crea tu contraseña</h2>
      <p className="mb-6 text-sm text-ink-900/50">
        Elige una contraseña para tu cuenta de padre/apoderado.
      </p>

      {checking ? (
        <p className="text-sm text-ink-900/50">Verificando tu invitación...</p>
      ) : !sessionReady ? (
        <p className="text-sm text-red-600">
          Este link de invitación ya no es válido o expiró. Pide a la
          academia que te envíe una invitación nueva.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-ink-900/80">
              Nueva contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirm" className="text-sm font-medium text-ink-900/80">
              Confirmar contraseña
            </label>
            <input
              id="confirm"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar y entrar"}
          </button>
        </form>
      )}
    </div>
  );
}
