'use client';

import { useState, useTransition } from 'react';
import { changeOwnPassword } from '@/app/cuenta/actions';

export default function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await changeOwnPassword(formData);
        setSuccess(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Algo salió mal');
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-muted">Contraseña actual</label>
        <input
          name="currentPassword"
          type="password"
          required
          className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted">Nueva contraseña</label>
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted">Confirmar nueva contraseña</label>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {error && <p className="text-sm text-expense">{error}</p>}
      {success && <p className="text-sm text-income">Contraseña actualizada correctamente.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-accent py-3 text-white font-medium hover:bg-accentDark transition disabled:opacity-60"
      >
        {isPending ? 'Guardando...' : 'Cambiar contraseña'}
      </button>
    </form>
  );
}
