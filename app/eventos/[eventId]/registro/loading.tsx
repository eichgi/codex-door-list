export default function RegistrationLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
      <div className="w-full max-w-2xl animate-pulse rounded-3xl border border-white/10 bg-white/5 p-10" role="status">
        <div className="h-4 w-32 rounded bg-slate-700" />
        <div className="mt-8 h-12 w-3/4 rounded bg-slate-700" />
        <div className="mt-5 h-5 w-1/2 rounded bg-slate-800" />
        <span className="sr-only">Cargando evento…</span>
      </div>
    </main>
  );
}
