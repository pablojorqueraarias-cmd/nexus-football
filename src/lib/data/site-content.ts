import { createClient } from "@/lib/supabase/server";

export type CategorySummary = {
  id: string;
  name: string;
  age_range: string | null;
  description: string | null;
};

// Usado como respaldo si Supabase aún no está conectado (ver .env.local.example),
// para que el sitio público sea navegable antes de completar el setup.
const FALLBACK_CATEGORIES: CategorySummary[] = [
  { id: "iniciacion", name: "Iniciación", age_range: "4 a 7 años", description: "Primer contacto con el fútbol: motricidad, coordinación y el gusto por el juego." },
  { id: "formacion", name: "Formación", age_range: "8 a 12 años", description: "Desarrollo técnico-táctico individual y trabajo en equipo." },
  { id: "proyeccion", name: "Proyección", age_range: "13 a 17 años", description: "Preparación de alto rendimiento orientada a la competencia y la proyección a clubes." },
];

export async function getCategories(): Promise<CategorySummary[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, age_range, description")
      .order("display_order");

    if (error || !data || data.length === 0) return FALLBACK_CATEGORIES;
    return data;
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

export type ScheduleEntry = {
  id: string;
  category_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
};

export async function getSchedules(): Promise<ScheduleEntry[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("schedules")
      .select("id, category_id, day_of_week, start_time, end_time, location")
      .order("display_order");

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export type GalleryItem = {
  id: string;
  storage_path: string;
  caption: string | null;
};

export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("gallery_items")
      .select("id, storage_path, caption")
      .order("display_order");

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export function publicGalleryUrl(storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return storagePath;
  return `${base}/storage/v1/object/public/gallery/${storagePath}`;
}
