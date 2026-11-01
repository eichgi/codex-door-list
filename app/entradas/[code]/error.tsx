"use client";

export default function TicketError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
      <section className="w-full max-w-lg rounded-3xl border border-red-300/20 bg-slate-900 p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-300">Algo salió mal</p>
        <h1 className="mt-3 text-3xl font-bold">No pudimos cargar la entrada</h1>
        <p className="mt-3 text-slate-300">Intenta nuevamente en unos momentos.</p>
        <button className="mt-7" type="button" onClick={reset}>Volver a intentar</button>
      </section>
    </main>
  );
}
