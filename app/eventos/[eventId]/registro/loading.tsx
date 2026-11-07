export default function RegistrationLoading() {
  return (
    <div className="grid animate-pulse gap-5 lg:grid-cols-[1.15fr_0.85fr]" aria-label="Cargando evento">
      <div className="min-h-128 rounded-3xl border border-white/10 bg-slate-900/85 p-6 sm:p-7">
        <div className="h-5 w-28 rounded bg-white/5" />
        <div className="mt-10 h-4 w-36 rounded bg-white/10" />
        <div className="mt-3 h-12 w-3/4 rounded-xl bg-white/10" />
        <div className="mt-4 h-6 w-full max-w-md rounded bg-white/5" />
        <div className="mt-8 h-28 rounded-2xl border border-white/10 bg-white/5" />
      </div>
      <div className="min-h-96 rounded-3xl border border-sky-300/40 bg-slate-900/90 p-6 sm:p-7">
        <div className="h-4 w-24 rounded bg-white/10" />
        <div className="mt-3 h-8 w-52 rounded bg-white/10" />
        <div className="mt-7 grid gap-5">
          {[0, 1, 2].map((field) => (
            <div key={field} className="h-20 rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
