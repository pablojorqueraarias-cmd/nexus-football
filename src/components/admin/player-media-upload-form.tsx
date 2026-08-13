"use client";

import { useActionState, useRef, useState } from "react";
import { uploadPlayerMediaAction, type PlayerMediaFormState } from "@/lib/actions/player-media";

const initialState: PlayerMediaFormState = { success: false };

export function PlayerMediaUploadForm({ playerId }: { playerId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [mediaType, setMediaType] = useState<"photo" | "video">("photo");
  const action = uploadPlayerMediaAction.bind(null, playerId);
  const [state, formAction, pending] = useActionState(async (prev: PlayerMediaFormState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result.success) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3 rounded-xl border border-ink-900/10 p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase text-ink-900/60">Tipo</label>
        <div className="flex overflow-hidden rounded-md border border-ink-900/15">
          <button
            type="button"
            onClick={() => setMediaType("photo")}
            className={`px-3 py-2 text-sm font-semibold ${mediaType === "photo" ? "bg-brand-500 text-white" : "text-ink-900/60"}`}
          >
            Foto
          </button>
          <button
            type="button"
            onClick={() => setMediaType("video")}
            className={`px-3 py-2 text-sm font-semibold ${mediaType === "video" ? "bg-brand-500 text-white" : "text-ink-900/60"}`}
          >
            Video
          </button>
        </div>
        <input type="hidden" name="media_type" value={mediaType} />
      </div>

      {mediaType === "photo" ? (
        <div className="flex flex-col gap-1">
          <label htmlFor="file" className="text-xs font-semibold uppercase text-ink-900/60">
            Imagen
          </label>
          <input id="file" name="file" type="file" accept="image/*" required className="text-sm" />
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <label htmlFor="video_url" className="text-xs font-semibold uppercase text-ink-900/60">
            Link de YouTube o Vimeo
          </label>
          <input
            id="video_url"
            name="video_url"
            placeholder="https://youtube.com/watch?v=..."
            required
            className="w-64 rounded-md border border-ink-900/15 px-3 py-2 text-sm"
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="caption" className="text-xs font-semibold uppercase text-ink-900/60">
          Descripción (opcional)
        </label>
        <input id="caption" name="caption" className="rounded-md border border-ink-900/15 px-3 py-2 text-sm" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Subir"}
      </button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
