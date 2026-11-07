"use client";

export default function RegistrationError({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto w-full max-w-lg rounded-3xl border border-red-400/30 bg-red-950/60 p-8 text-center text-red-100">
        <p className="text-xs font-bold uppercase tracking-[0.2em]">Algo salió mal</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">No pudimos cargar el evento</h1>
        <p className="mt-3 text-slate-300">Revisa tu conexión e intenta nuevamente.</p>
        <button className="mt-7 rounded-xl bg-sky-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-red-950" type="button" onClick={reset}>Volver a intentar</button>
    </section>
  );
}
