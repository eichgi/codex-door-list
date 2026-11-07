export default function DashboardLoading() {
  return (
    <section className="animate-pulse py-10" aria-label="Cargando panel">
      <div className="h-12 w-64 rounded-xl bg-white/10" />
      <div className="mt-4 h-6 w-96 max-w-full rounded-lg bg-white/5" />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-64 rounded-3xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
    </section>
  );
}
