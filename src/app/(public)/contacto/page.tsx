import { ContactForm } from "@/components/contact-form";

export const metadata = { title: "Contacto — Nexus Football" };

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Contacto</p>
      <h1 className="font-display mt-2 text-4xl font-bold uppercase tracking-tight text-ink-900">
        Escríbenos
      </h1>
      <p className="mt-3 text-ink-900/60">
        ¿Tienes dudas sobre nuestros programas, horarios o el proceso de
        inscripción? Completa el formulario y te contactaremos.
      </p>

      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
