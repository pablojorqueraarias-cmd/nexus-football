"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DayOfWeek } from "@/types/database.types";

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
}

const scheduleSchema = z.object({
  category_id: z.string().uuid(),
  day_of_week: z.enum(["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]),
  start_time: z.string().min(4),
  end_time: z.string().min(4),
  location: z.string().min(2, "Indica la sede."),
});

export async function createScheduleAction(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();

  const parsed = scheduleSchema.parse({
    category_id: formData.get("category_id"),
    day_of_week: formData.get("day_of_week") as DayOfWeek,
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    location: formData.get("location"),
  });

  const { error } = await supabase.from("schedules").insert(parsed);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/horarios");
  revalidatePath("/horarios");
}

export async function deleteScheduleAction(scheduleId: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("schedules").delete().eq("id", scheduleId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/horarios");
  revalidatePath("/horarios");
}
