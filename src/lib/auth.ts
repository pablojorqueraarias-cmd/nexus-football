import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getCurrentProfile = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return profile;
  } catch {
    // Supabase aún no está configurado (ver .env.local.example) — se trata
    // como usuario no autenticado en vez de romper el panel.
    return null;
  }
});
