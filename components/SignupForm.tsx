'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { signup } from '@/app/signup/actions';
import Switch from './Switch';

export default function SignupForm() {
  const [share, setShare] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await signup(formData);
        setDone(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Algo salió mal');
      }
    });
  }

  if (done) {
    return (
      <div className="text-center space-y-3">
        <div className="text-3xl">✅</div>
        <h2 className="text-lg font-semibold text-ink">Solicitud enviada</h2>
        <p className="text-sm text-muted">
          Tu cuenta quedó pendiente de aprobación. Te podrán dar acceso una vez la revisen.
        </p>
        <Link href="/login" className="inline-block text-accent font-medium text-sm">
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-muted">Correo</label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted">Nombres</label>
          <input
            name="firstName"
            type="text"
            required
            className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Apellidos</label>
          <input
            name="lastName"
            type="text"
            required
            className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted">Celular</label>
        <input
          name="phone"
          type="tel"
          required
          className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted">Contraseña</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Confirmar</label>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted">¿Por qué quieres usar la app? (opcional)</label>
        <textarea
          name="reason"
          rows={2}
          className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-bg px-4 py-3">
        <Switch name="share" checked={share} onChange={setShare} />
        <span className="text-sm text-ink">
          Quiero compartir cuenta con alguien que ya tiene acceso (verán los mismos datos)
        </span>
      </div>

      {share && (
        <div>
          <label className="text-xs font-medium text-muted">Correo de esa cuenta</label>
          <input
            name="shareWithEmail"
            type="email"
            required={share}
            placeholder="correo@ejemplo.com"
            className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      )}

      {error && <p className="text-sm text-expense">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-accent py-3 text-white font-medium hover:bg-accentDark transition disabled:opacity-60"
      >
        {isPending ? 'Enviando...' : 'Solicitar acceso'}
      </button>

      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-accent font-medium">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
