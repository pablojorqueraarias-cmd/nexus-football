"use client";

import { useTransition } from "react";
import { getDocumentSignedUrlAction } from "@/lib/actions/documents";

export function DocumentDownloadButton({ documentId }: { documentId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            const url = await getDocumentSignedUrlAction(documentId);
            window.open(url, "_blank");
          } catch {
            alert("No se pudo descargar el documento.");
          }
        });
      }}
      className="text-xs font-semibold uppercase tracking-wide text-brand-500 hover:text-brand-600 disabled:opacity-50"
    >
      {pending ? "..." : "Descargar"}
    </button>
  );
}
