import Link from "next/link";

export default function RegistrationNotFound() {
  return (
    <section className="mx-auto w-full max-w-lg rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">Registro no disponible</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Este evento no acepta registros</h1>
        <p className="mt-3 text-slate-300">Puede que el evento no esté publicado o que su fecha ya haya pasado.</p>
        <Link className="mt-7 inline-flex rounded-xl bg-sky-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950" href="/">Volver al inicio</Link>
    </section>
  );
}
