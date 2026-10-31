import Link from "next/link";
import { signIn, signUp } from "./actions";

export const instant = false;

export default async function AccessPage({
  searchParams,
}: PageProps<"/acceso">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";
  const message = typeof params.message === "string" ? params.message : "";
  const next = typeof params.next === "string" ? params.next : "/organizador";

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="back-link">← Dool Fest</Link>
        <p className="eyebrow">Área de organización</p>
        <h1>Gestiona tu evento</h1>
        <p className="muted">Inicia sesión o crea una cuenta de organizador.</p>
        {error && <p className="notice error" role="alert">{error}</p>}
        {message && <p className="notice">{message}</p>}
        <form action={signIn} className="stack-form">
          <input type="hidden" name="next" value={next} />
          <label>Correo<input name="email" type="email" required autoComplete="email" /></label>
          <label>Contraseña<input name="password" type="password" required minLength={6} autoComplete="current-password" /></label>
          <button type="submit">Entrar</button>
        </form>
        <form action={signUp} className="stack-form secondary-form">
          <input type="hidden" name="next" value={next} />
          <label>¿Aún no tienes cuenta?<input name="email" type="email" required placeholder="tu@correo.com" /></label>
          <label>Elige una contraseña<input name="password" type="password" required minLength={6} /></label>
          <button type="submit" className="secondary-button">Crear cuenta</button>
        </form>
      </section>
    </main>
  );
}
