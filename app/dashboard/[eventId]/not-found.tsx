import Link from "next/link";

export default function DashboardEventNotFound() {
  return (
    <section className="py-20 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
        Evento no disponible
      </p>
      <h1 className="mt-3 text-4xl font-bold">No encontramos este evento</h1>
      <p className="mx-auto mt-4 max-w-lg text-slate-400">
        El evento no existe o no tienes permiso para consultar su información.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 inline-flex rounded-xl bg-sky-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-200"
      >
        Volver a tus eventos
      </Link>
    </section>
  );
}
