export default function OrganizerLoading() {
  return (
    <div className="animate-pulse" aria-label="Cargando panel del organizador">
      <div className="border-b border-white/10 pb-8">
        <div className="h-5 w-28 rounded bg-white/5" />
        <div className="mt-5 h-4 w-44 rounded bg-white/10" />
        <div className="mt-3 h-12 w-full max-w-xl rounded-xl bg-white/10" />
        <div className="mt-4 h-6 w-full max-w-2xl rounded bg-white/5" />
      </div>
      <div className="mt-12 h-8 w-48 rounded bg-white/10" />
      <div className="mt-6 h-80 rounded-2xl border border-white/10 bg-slate-900/85" />
      <div className="mt-12 h-8 w-40 rounded bg-white/10" />
      <div className="mt-6 h-96 rounded-3xl border border-white/10 bg-slate-900/85" />
    </div>
  );
}
