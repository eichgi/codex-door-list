import Link from "next/link";
import { signOut } from "@/app/acceso/actions";

export function DashboardHeader() {
  return (
    <header className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link
          href="/"
          className="text-sm font-bold text-sky-300 transition hover:text-sky-200"
        >
          ← Dool Fest
        </Link>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-sky-300">
          Panel del organizador
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/organizador"
          className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:border-sky-300/60 hover:text-white"
        >
          Gestionar eventos
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-100 transition hover:bg-slate-700"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </header>
  );
}
