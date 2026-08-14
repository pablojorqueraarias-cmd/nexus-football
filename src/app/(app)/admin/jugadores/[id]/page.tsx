import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteEvaluationAction } from "@/lib/actions/evaluations";
import { deleteDocumentAction } from "@/lib/actions/documents";
import { invitePlayerAction } from "@/lib/actions/players";
import { PlayerPositionSelect } from "@/components/admin/player-position-select";
import { DocumentUploadForm } from "@/components/admin/document-upload-form";
import { DocumentDownloadButton } from "@/components/document-download-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { EvaluationReportCard } from "@/components/evaluations/evaluation-report-card";
import { groupEvaluationByPhase } from "@/lib/evaluation-report";
import { PlayerMediaUploadForm } from "@/components/admin/player-media-upload-form";
import { PlayerMediaGrid } from "@/components/player-media-grid";
import { getPlayerMediaWithUrls } from "@/lib/data/player-media";

const CATEGORY_LABELS: Record<string, string> = {
  antropometrica: "Evaluación antropométrica",
  carta_colegio: "Carta para el colegio",
  concentracion_notas: "Concentración de notas",
  otro: "Otro",
};

export default async function AdminJugadorDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase
    .from("players")
    .select(
      "id, full_name, status, birth_date, position_id, user_id, category:categories(name), parent:profiles!players_parent_id_fkey(full_name)"
    )
    .eq("id", id)
    .single();

  if (!player) notFound();

  const [{ data: positions }, { data: evaluations }, { data: stats }, { data: documents }, media] =
    await Promise.all([
      supabase.from("positions").select("id, name").order("display_order"),
      supabase
        .from("evaluations")
        .select("*, evaluator:profiles(full_name), evaluation_items(highlight, comment, checklist_criteria(label, phase))")
        .eq("player_id", id)
        .order("created_at", { ascending: false }),
      supabase.from("player_stats_summary").select("*").eq("player_id", id).maybeSingle(),
      supabase.from("player_documents").select("*").eq("player_id", id).order("uploaded_at", { ascending: false }),
      getPlayerMediaWithUrls(id),
    ]);

  let pendingInvite: { email: string } | null = null;
  if (player.user_id) {
    const { data: authUser } = await createAdminClient().auth.admin.getUserById(player.user_id);
    if (authUser.user && !authUser.user.email_confirmed_at) {
      pendingInvite = { email: authUser.user.email ?? "" };
    }
  }

  const category = player.category as { name: string } | null;
  const parent = player.parent as { full_name: string } | null;
  const latest = evaluations?.[0];
  const history = evaluations?.slice(1) ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/jugadores" className="text-xs font-semibold uppercase tracking-wide text-ink-900/40 hover:text-brand-500">
            ← Alumnos
          </Link>
          <h1 className="font-display mt-1 text-3xl font-bold uppercase tracking-tight text-ink-900">
            {player.full_name}
          </h1>
          <p className="mt-1 text-ink-900/60">
            {category?.name ?? "Sin categoría"} · Apoderado: {parent?.full_name ?? "Sin asignar"}
          </p>
        </div>
        <Link
          href={`/admin/jugadores/${id}/evaluar`}
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600"
        >
          Nueva evaluación
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-ink-900/10 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">Posición</h2>
          <div className="mt-2">
            <PlayerPositionSelect playerId={id} positionId={player.position_id} positions={positions ?? []} />
          </div>
        </div>

        <div className="rounded-xl border border-ink-900/10 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">Asistencia</h2>
          <p className="font-display mt-2 text-2xl font-bold text-ink-900">
            {stats ? `${stats.sessions_present}/${stats.sessions_total}` : "0/0"}
          </p>
        </div>

        <div className="rounded-xl border border-ink-900/10 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">
            Partidos jugados
          </h2>
          <p className="font-display mt-2 text-2xl font-bold text-ink-900">
            {stats?.matches_played ?? 0}
          </p>
          <p className="mt-1 text-xs text-ink-900/50">
            {stats?.total_minutes ?? 0}′ · {stats?.total_goals ?? 0} goles · {stats?.total_assists ?? 0} asistencias
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-ink-900/10 p-4">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-900/70">
          Acceso del jugador/a
        </h2>
        {player.user_id && !pendingInvite ? (
          <p className="mt-2 text-sm text-green-700">Ya tiene una cuenta propia para ingresar.</p>
        ) : pendingInvite ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-sm text-amber-700">
              Invitación enviada a {pendingInvite.email}, todavía no ha ingresado.
            </p>
            <form action={invitePlayerAction.bind(null, id)}>
              <input type="hidden" name="player_email" value={pendingInvite.email} />
              <input type="hidden" name="player_full_name" value={player.full_name} />
              <button
                type="submit"
                className="rounded-md border border-brand-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-500 hover:bg-brand-50"
              >
                Reenviar invitación
              </button>
            </form>
          </div>
        ) : (
          <form action={invitePlayerAction.bind(null, id)} className="mt-3 flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-900/50">Correo del jugador/a</label>
              <input
                name="player_email"
                type="email"
                required
                className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-900/50">Nombre</label>
              <input
                name="player_full_name"
                defaultValue={player.full_name}
                required
                className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600"
            >
              Invitar acceso
            </button>
          </form>
        )}
      </div>

      <div>
        <h2 className="font-display text-lg font-bold uppercase text-ink-900">Evaluaciones</h2>

        {!latest ? (
          <div className="mt-4 rounded-xl border border-dashed border-ink-900/15 p-10 text-center text-ink-900/50">
            Aún no hay evaluaciones para este jugador/a.
          </div>
        ) : (
          <div className="mt-4">
            <EvaluationReportCard
              createdAt={latest.created_at}
              evaluatorName={(latest.evaluator as { full_name: string } | null)?.full_name ?? null}
              strengths={latest.strengths}
              weaknesses={latest.weaknesses}
              conclusion={latest.conclusion}
              matchContext={latest.match_context}
              items={latest.evaluation_items}
              actions={
                <>
                  <Link
                    href={`/admin/jugadores/${id}/evaluaciones/${latest.id}`}
                    className="text-xs font-semibold uppercase tracking-wide text-brand-500 hover:text-brand-600"
                  >
                    Reporte completo
                  </Link>
                  <DeleteButton
                    action={deleteEvaluationAction.bind(null, latest.id, id)}
                    confirmMessage="¿Eliminar esta evaluación?"
                  />
                </>
              }
            />
          </div>
        )}

        {history.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {history.map((ev) => {
              const { totalItems, totalHighlighted } = groupEvaluationByPhase(ev.evaluation_items);
              return (
                <li key={ev.id} className="flex items-center justify-between gap-3 rounded-lg border border-ink-900/10 px-4 py-2 text-sm">
                  <span className="text-ink-900/70">
                    {new Date(ev.created_at).toLocaleDateString("es-CL")} ·{" "}
                    {(ev.evaluator as { full_name: string } | null)?.full_name ?? "Admin"} ·{" "}
                    <span className="font-semibold text-ink-900">
                      {totalItems > 0 ? `${totalHighlighted}/${totalItems} a destacar` : "—"}
                    </span>
                  </span>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/jugadores/${id}/evaluaciones/${ev.id}`}
                      className="text-xs font-semibold uppercase tracking-wide text-brand-500 hover:text-brand-600"
                    >
                      Ver
                    </Link>
                    <DeleteButton
                      action={deleteEvaluationAction.bind(null, ev.id, id)}
                      confirmMessage="¿Eliminar esta evaluación?"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div>
        <h2 className="font-display text-lg font-bold uppercase text-ink-900">Documentos</h2>
        <div className="mt-4">
          <DocumentUploadForm playerId={id} />
        </div>

        {(!documents || documents.length === 0) ? (
          <p className="mt-4 text-sm text-ink-900/50">Sin documentos subidos.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border border-ink-900/10 px-4 py-2 text-sm">
                <div>
                  <p className="font-medium text-ink-900">{doc.file_name}</p>
                  <p className="text-xs text-ink-900/50">
                    {CATEGORY_LABELS[doc.category ?? ""] ?? "Documento"} ·{" "}
                    {new Date(doc.uploaded_at).toLocaleDateString("es-CL")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <DocumentDownloadButton documentId={doc.id} />
                  <DeleteButton
                    action={deleteDocumentAction.bind(null, doc.id, doc.storage_path, id)}
                    confirmMessage="¿Eliminar este documento?"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="font-display text-lg font-bold uppercase text-ink-900">Fotos y videos</h2>
        <div className="mt-4">
          <PlayerMediaUploadForm playerId={id} />
        </div>
        <div className="mt-4">
          <PlayerMediaGrid items={media} playerId={id} editable />
        </div>
      </div>
    </div>
  );
}
