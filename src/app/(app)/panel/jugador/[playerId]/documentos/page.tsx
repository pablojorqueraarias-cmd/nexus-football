import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentDownloadButton } from "@/components/document-download-button";

const CATEGORY_LABELS: Record<string, string> = {
  antropometrica: "Evaluación antropométrica",
  carta_colegio: "Carta para el colegio",
  concentracion_notas: "Concentración de notas",
  otro: "Otro",
};

export default async function JugadorDocumentosPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase.from("players").select("id, full_name").eq("id", playerId).single();
  if (!player) notFound();

  const { data: documents } = await supabase
    .from("player_documents")
    .select("*")
    .eq("player_id", playerId)
    .order("uploaded_at", { ascending: false });

  return (
    <div>
      <Link href={`/panel/jugador/${playerId}`} className="text-xs font-semibold uppercase tracking-wide text-ink-900/40 hover:text-brand-500">
        ← {player.full_name}
      </Link>
      <h1 className="font-display mt-1 text-3xl font-bold uppercase tracking-tight text-ink-900">
        Documentos
      </h1>

      {(!documents || documents.length === 0) ? (
        <div className="mt-8 rounded-xl border border-dashed border-ink-900/15 p-10 text-center text-ink-900/50">
          Aún no hay documentos disponibles.
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-2">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border border-ink-900/10 px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-ink-900">{doc.file_name}</p>
                <p className="text-xs text-ink-900/50">
                  {CATEGORY_LABELS[doc.category ?? ""] ?? "Documento"} ·{" "}
                  {new Date(doc.uploaded_at).toLocaleDateString("es-CL")}
                </p>
              </div>
              <DocumentDownloadButton documentId={doc.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
