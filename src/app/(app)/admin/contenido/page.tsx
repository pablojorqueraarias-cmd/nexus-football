import { getSiteContent } from "@/lib/data/site-content";
import { SiteContentForm } from "@/components/admin/site-content-form";

export default async function AdminContenidoPage() {
  const content = await getSiteContent();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
        Contenido del sitio
      </h1>
      <p className="mt-1 text-ink-900/60">
        Edita los textos principales que se muestran en el sitio público.
      </p>

      <div className="mt-8">
        <SiteContentForm content={content} />
      </div>
    </div>
  );
}
