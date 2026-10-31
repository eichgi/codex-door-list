export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-16 text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.24),transparent_38%)]"
      />

      <section className="relative w-full max-w-3xl rounded-3xl border border-white/15 bg-white/10 px-8 py-14 text-center shadow-2xl shadow-sky-950/30 backdrop-blur sm:px-14 sm:py-20">
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          Dool Fest 2026
        </h1>
        <p className="mt-8 text-xl font-medium text-sky-200 sm:text-2xl">
          21 de noviembre de 2026
        </p>
        <p className="mt-3 text-lg text-slate-300 sm:text-xl">
          Auditorio Nacional, Ciudad de México
        </p>
        <button
          type="button"
          className="mt-10 rounded-full bg-sky-400 px-8 py-4 text-lg font-bold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
        >
          Regístrame
        </button>
      </section>
    </main>
  );
}
