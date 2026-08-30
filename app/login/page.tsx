import { login } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4">
      <form action={login} className="w-full max-w-sm bg-card rounded-xl2 shadow-soft p-8 space-y-4">
        <input type="hidden" name="next" value={params?.next || '/'} />
        <div className="text-center space-y-1">
          <div className="text-3xl">💙</div>
          <h1 className="text-xl font-semibold text-ink">Mis Finanzas</h1>
          <p className="text-sm text-muted">Ingresa tu contraseña para continuar</p>
        </div>
        {params?.error && (
          <p className="text-sm text-expense text-center">Contraseña incorrecta</p>
        )}
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          required
          autoFocus
          className="w-full rounded-xl border border-border px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-accent py-3 text-white font-medium hover:bg-accentDark transition"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
