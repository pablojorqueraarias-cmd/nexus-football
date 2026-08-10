"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().min(2, "Ingresa tu nombre."),
  email: z.string().email("Ingresa un correo válido."),
  phone: z.string().optional(),
  message: z.string().min(5, "Cuéntanos brevemente en qué te ayudamos."),
});

export type ContactFormState = { success: boolean; error?: string };

export async function submitContactAction(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: (formData.get("phone") as string) || undefined,
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert(parsed.data);

    if (error) {
      return { success: false, error: "No se pudo enviar el mensaje. Intenta de nuevo." };
    }

    return { success: true };
  } catch {
    return { success: false, error: "No se pudo enviar el mensaje. Intenta de nuevo." };
  }
}
