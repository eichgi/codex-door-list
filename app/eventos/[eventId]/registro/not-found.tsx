import Link from "next/link";

export default function RegistrationNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
      <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Registro no disponible</p>
        <h1 className="mt-3 text-3xl font-bold">Este evento no acepta registros</h1>
        <p className="mt-3 text-slate-300">Puede que el evento no esté publicado o que su fecha ya haya pasado.</p>
        <Link className="mt-7 inline-block font-bold text-sky-300 hover:text-sky-200" href="/">Volver al inicio</Link>
      </section>
    </main>
  );
}
