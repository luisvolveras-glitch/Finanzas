'use client';

import { useState, useTransition } from 'react';
import { createCard, editCard } from '@/app/tarjetas/actions';

export interface EditableCard {
  id: number;
  name: string;
  lastFour: string;
}

export default function CardModal({
  trigger,
  initial,
}: {
  trigger: (open: () => void) => React.ReactNode;
  initial?: EditableCard;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function close() {
    setOpen(false);
    setError(null);
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        if (initial) {
          await editCard(initial.id, formData);
        } else {
          await createCard(formData);
        }
        close();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Algo salió mal');
      }
    });
  }

  return (
    <>
      {trigger(() => setOpen(true))}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
          <div className="w-full sm:max-w-md bg-card rounded-t-xl2 sm:rounded-xl2 shadow-soft p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">
                {initial ? 'Editar tarjeta' : 'Nueva tarjeta de crédito'}
              </h2>
              <button onClick={close} className="text-muted text-xl leading-none">
                ×
              </button>
            </div>

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted">Nombre / banco</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={initial?.name}
                  placeholder="Ej: Banco de Bogotá GOLD"
                  className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted">Últimos 4 dígitos (opcional)</label>
                <input
                  name="lastFour"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  defaultValue={initial?.lastFour}
                  placeholder="Ej: 1234"
                  className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {error && <p className="text-sm text-expense">{error}</p>}

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-full bg-accent py-3 text-white font-medium hover:bg-accentDark transition disabled:opacity-60"
              >
                {isPending ? 'Guardando...' : initial ? 'Guardar cambios' : 'Agregar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
