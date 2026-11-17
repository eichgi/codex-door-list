export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:py-16">
      <div
        className="mx-auto w-full max-w-6xl animate-pulse"
        aria-busy="true"
        aria-label="Cargando eventos"
      >
        <div className="border-b border-white/10 pb-10">
          <div className="h-14 w-full max-w-3xl rounded-xl bg-white/10 sm:h-16" />
          <div className="mt-4 h-6 w-full max-w-2xl rounded bg-white/5" />
        </div>
        <section className="py-10">
          <div className="h-9 w-56 rounded bg-white/10" />
          <div className="mt-7 h-20 w-full max-w-md rounded-2xl border border-white/10 bg-white/5" />
          <div className="mt-7 border-t border-white/10">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="grid gap-5 border-b border-white/10 py-7 lg:grid-cols-[11rem_minmax(0,1fr)_13rem] lg:gap-8"
              >
                <div className="h-12 rounded bg-white/5" />
                <div>
                  <div className="h-8 w-3/4 rounded bg-white/10" />
                  <div className="mt-3 h-5 w-2/5 rounded bg-white/5" />
                  <div className="mt-5 h-16 max-w-2xl rounded bg-white/5" />
                </div>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-1">
                  <div className="h-20 rounded bg-white/5" />
                  <div className="h-12 rounded-xl bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
