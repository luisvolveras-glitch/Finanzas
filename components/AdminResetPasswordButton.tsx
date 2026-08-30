'use client';

import { useState, useTransition } from 'react';
import { adminResetPassword } from '@/app/cuenta/actions';

export default function AdminResetPasswordButton({ userId }: { userId: number }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await adminResetPassword(userId, formData);
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
        }, 1200);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Algo salió mal');
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-bg px-3 py-1.5 text-xs font-medium text-ink"
      >
        Restablecer contraseña
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="mt-2 flex flex-wrap items-center gap-2">
      <input
        name="newPassword"
        type="password"
        placeholder="Nueva contraseña"
        required
        minLength={8}
        className="min-w-0 flex-1 rounded-full border-0 bg-bg px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
      >
        {isPending ? '...' : 'Guardar'}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="rounded-full bg-bg px-3 py-1.5 text-xs font-medium text-muted"
      >
        Cancelar
      </button>
      {error && <p className="w-full text-xs text-expense">{error}</p>}
      {success && <p className="w-full text-xs text-income">Contraseña actualizada.</p>}
    </form>
  );
}
