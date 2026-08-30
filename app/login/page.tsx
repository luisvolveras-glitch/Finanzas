import Link from 'next/link';
import LogoIcon from '@/components/icons/LogoIcon';
import { login } from './actions';

const ERROR_MESSAGES: Record<string, string> = {
  credenciales: 'Correo o contraseña incorrectos',
  pendiente: 'Tu cuenta todavía está pendiente de aprobación',
  rechazada: 'Tu solicitud de acceso fue rechazada',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params?.error ? ERROR_MESSAGES[params.error] : undefined;

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4">
      <form action={login} className="w-full max-w-sm bg-card rounded-xl2 shadow-soft p-8 space-y-4">
        <input type="hidden" name="next" value={params?.next || '/'} />
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white">
            <LogoIcon className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-semibold text-ink">Mis Finanzas</h1>
          <p className="text-sm text-muted">Ingresa tu correo y contraseña para continuar</p>
        </div>
        {errorMessage && <p className="text-sm text-expense text-center">{errorMessage}</p>}
        <input
          type="email"
          name="email"
          placeholder="Correo"
          required
          autoFocus
          className="w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          required
          className="w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          className="w-full rounded-full bg-accent py-3 text-white font-medium hover:bg-accentDark transition"
        >
          Entrar
        </button>
        <p className="text-center text-sm text-muted">
          ¿No tienes cuenta?{' '}
          <Link href="/signup" className="text-accent font-medium">
            Solicitar acceso
          </Link>
        </p>
      </form>
    </main>
  );
}
