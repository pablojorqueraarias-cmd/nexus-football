"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Solo el administrador puede hacer esto");
  return user.id;
}

export type DocumentFormState = { success: boolean; error?: string };

export async function uploadDocumentAction(
  playerId: string,
  _prevState: DocumentFormState,
  formData: FormData
): Promise<DocumentFormState> {
  const adminId = await assertAdmin();
  const supabase = await createClient();

  const file = formData.get("file") as File | null;
  const category = (formData.get("category") as string) || null;

  if (!file || file.size === 0) return { success: false, error: "Selecciona un archivo." };

  const ext = file.name.split(".").pop() ?? "pdf";
  const path = `${playerId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
  if (uploadError) return { success: false, error: "No se pudo subir el archivo." };

  const { error: insertError } = await supabase.from("player_documents").insert({
    player_id: playerId,
    storage_path: path,
    file_name: file.name,
    category,
    uploaded_by: adminId,
  });

  if (insertError) return { success: false, error: "No se pudo guardar el documento." };

  revalidatePath(`/admin/jugadores/${playerId}`);
  return { success: true };
}

export async function deleteDocumentAction(documentId: string, storagePath: string, playerId: string) {
  await assertAdmin();
  const supabase = await createClient();

  await supabase.storage.from("documents").remove([storagePath]);
  const { error } = await supabase.from("player_documents").delete().eq("id", documentId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/jugadores/${playerId}`);
}

export async function getDocumentSignedUrlAction(documentId: string): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // El select respeta RLS: si el documento no le pertenece (no es admin, ni
  // apoderado, ni el propio jugador), esta consulta no devuelve la fila.
  const { data: doc } = await supabase
    .from("player_documents")
    .select("storage_path")
    .eq("id", documentId)
    .single();

  if (!doc) throw new Error("No tienes acceso a este documento.");

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("documents")
    .createSignedUrl(doc.storage_path, 60);

  if (error || !data) throw new Error("No se pudo generar el link de descarga.");
  return data.signedUrl;
}
