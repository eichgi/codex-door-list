"use client";

export default function HomeError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-5 py-10 text-white sm:py-16">
      <section className="w-full max-w-lg rounded-3xl border border-red-400/30 bg-red-950/60 p-8 text-center text-red-100">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">No pudimos cargar los eventos</h1>
        <p className="mt-4 text-base leading-7 text-slate-300">Revisa tu conexión e intenta nuevamente. Si el problema continúa, vuelve a intentarlo más tarde.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-7 rounded-xl bg-sky-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-red-950"
        >
          Volver a intentar
        </button>
      </section>
    </main>
  );
}
