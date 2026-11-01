export default function TicketLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
      <div className="h-96 w-full max-w-4xl animate-pulse rounded-3xl border border-white/10 bg-white/5" role="status">
        <span className="sr-only">Cargando entrada…</span>
      </div>
    </main>
  );
}
