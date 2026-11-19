"use client";

import { useState } from "react";

export function CopyTicketCode({ code }: { code: string }) {
  const [message, setMessage] = useState<string | null>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setMessage("Código copiado.");
    } catch {
      setMessage("No fue posible copiar el código. Muéstralo al personal de acceso.");
    }
  }

  return (
    <div className="mt-3 grid justify-items-center gap-2">
      <button
        className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm font-bold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        type="button"
        onClick={handleCopy}
      >
        Copiar código
      </button>
      <p aria-live="polite" className="min-h-5 text-center text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}
