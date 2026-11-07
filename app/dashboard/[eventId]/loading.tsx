export default function DashboardEventLoading() {
  return (
    <section className="animate-pulse py-9" aria-label="Cargando detalle del evento">
      <div className="h-5 w-40 rounded bg-white/5" />
      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full max-w-3xl">
          <div className="h-4 w-36 rounded bg-white/10" />
          <div className="mt-4 h-12 w-3/4 rounded-xl bg-white/10" />
          <div className="mt-5 h-5 w-56 rounded bg-white/5" />
          <div className="mt-3 h-5 w-40 rounded bg-white/5" />
        </div>
        <div className="h-24 w-48 rounded-2xl border border-white/10 bg-white/5" />
      </div>

      <div className="mt-12">
        <div className="h-4 w-20 rounded bg-white/10" />
        <div className="mt-3 h-8 w-52 rounded-lg bg-white/10" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-44 rounded-2xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      </div>

      <div className="mt-12 h-72 rounded-2xl border border-white/10 bg-white/5" />
      <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/85">
        <div className="h-14 border-b border-white/10 bg-white/5" />
        <div className="divide-y divide-white/10">
          {[0, 1, 2].map((item) => (
            <div key={item} className="grid grid-cols-3 gap-5 px-5 py-5">
              <div className="h-5 rounded bg-white/10" />
              <div className="h-5 rounded bg-white/5" />
              <div className="h-5 rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
