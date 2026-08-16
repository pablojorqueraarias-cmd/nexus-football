import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePlayerAction } from "@/lib/actions/players";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default async function EditarJugadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: player }, { data: categories }] = await Promise.all([
    supabase.from("players").select("*").eq("id", id).single(),
    supabase.from("categories").select("id, name").order("display_order"),
  ]);

  if (!player) notFound();

  async function action(formData: FormData) {
    "use server";
    await updatePlayerAction(id, formData);
    redirect(`/admin/jugadores/${id}`);
  }

  return (
    <div>
      <Link href={`/admin/jugadores/${id}`} className="text-xs font-semibold uppercase tracking-wide text-ink-900/40 hover:text-brand-500">
        ← {player.full_name}
      </Link>
      <h1 className="font-display mt-1 text-3xl font-bold uppercase tracking-tight text-ink-900">
        Editar alumno
      </h1>

      <form action={action} className="mt-8 flex max-w-lg flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="full_name" className="text-sm font-semibold text-ink-900">
            Nombre completo
          </label>
          <input
            id="full_name"
            name="full_name"
            defaultValue={player.full_name}
            required
            className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="birth_date" className="text-sm font-semibold text-ink-900">
              Fecha de nacimiento
            </label>
            <input
              id="birth_date"
              name="birth_date"
              type="date"
              defaultValue={player.birth_date ?? ""}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="category_id" className="text-sm font-semibold text-ink-900">
              Categoría
            </label>
            <select
              id="category_id"
              name="category_id"
              defaultValue={player.category_id ?? ""}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Sin categoría</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-sm font-semibold text-ink-900">
            Estado
          </label>
          <select
            id="status"
            name="status"
            defaultValue={player.status}
            className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div className="mt-2 flex flex-col gap-1 border-t border-ink-900/10 pt-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-900/70">
            Datos personales y médicos
          </h2>
          <p className="text-xs text-ink-900/40">
            Solo lo ven el admin, el apoderado y el propio jugador/a.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="rut" className="text-sm font-semibold text-ink-900">
              RUT
            </label>
            <input
              id="rut"
              name="rut"
              placeholder="12.345.678-9"
              defaultValue={player.rut ?? ""}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="clothing_size" className="text-sm font-semibold text-ink-900">
              Talla de ropa
            </label>
            <input
              id="clothing_size"
              name="clothing_size"
              placeholder="Ej: 10, S, M"
              defaultValue={player.clothing_size ?? ""}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="blood_type" className="text-sm font-semibold text-ink-900">
            Grupo sanguíneo
          </label>
          <select
            id="blood_type"
            name="blood_type"
            defaultValue={player.blood_type ?? ""}
            className="w-40 rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Sin especificar</option>
            {BLOOD_TYPES.map((bt) => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="allergies" className="text-sm font-semibold text-ink-900">
            Alergias
          </label>
          <textarea
            id="allergies"
            name="allergies"
            rows={2}
            placeholder="Ej: alérgico a la penicilina"
            defaultValue={player.allergies ?? ""}
            className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="chronic_conditions" className="text-sm font-semibold text-ink-900">
            Enfermedades crónicas / condiciones médicas
          </label>
          <textarea
            id="chronic_conditions"
            name="chronic_conditions"
            rows={2}
            placeholder="Ej: asma, requiere inhalador"
            defaultValue={player.chronic_conditions ?? ""}
            className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="notes" className="text-sm font-semibold text-ink-900">
            Notas (opcional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={player.notes ?? ""}
            className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <button
          type="submit"
          className="mt-2 self-start rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
