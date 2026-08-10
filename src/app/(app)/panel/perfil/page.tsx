import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";

export default async function PanelPerfilPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
        Mi perfil
      </h1>
      <p className="mt-1 text-ink-900/60">Actualiza tus datos de contacto.</p>

      <div className="mt-8">
        <ProfileForm
          fullName={profile?.full_name ?? ""}
          phone={profile?.phone ?? null}
          email={user?.email ?? ""}
        />
      </div>
    </div>
  );
}
