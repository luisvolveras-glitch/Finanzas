'use client';

import { useState, useTransition } from 'react';
import { createDebt, editDebt } from '@/app/deudas/actions';

export interface EditableDebt {
  id: number;
  entity: string;
  detail: string;
  amount: number;
  interestRate: number | null;
  termMonths: number | null;
}

export default function DebtModal({
  trigger,
  initial,
}: {
  trigger: (open: () => void) => React.ReactNode;
  initial?: EditableDebt;
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
          await editDebt(initial.id, formData);
        } else {
          await createDebt(formData);
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
                {initial ? 'Editar deuda' : 'Nueva deuda'}
              </h2>
              <button onClick={close} className="text-muted text-xl leading-none">
                ×
              </button>
            </div>

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted">Entidad</label>
                <input
                  name="entity"
                  type="text"
                  required
                  defaultValue={initial?.entity}
                  placeholder="Ej: Sra Marina, Banco de Bogotá..."
                  className="mt-1 w-full rounded-xl border border-border px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted">Detalle</label>
                <input
                  name="detail"
                  type="text"
                  defaultValue={initial?.detail}
                  placeholder="Ej: Préstamo gastos variados..."
                  className="mt-1 w-full rounded-xl border border-border px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted">Monto original de la deuda</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  defaultValue={initial?.amount}
                  placeholder="0.00"
                  className="mt-1 w-full rounded-xl border border-border px-4 py-3 text-lg font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted">Interés % (opcional)</label>
                  <input
                    name="interestRate"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={initial?.interestRate ?? undefined}
                    placeholder="Ej: 2.5"
                    className="mt-1 w-full rounded-xl border border-border px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted">Plazo (meses)</label>
                  <input
                    name="termMonths"
                    type="number"
                    step="1"
                    min="1"
                    defaultValue={initial?.termMonths ?? undefined}
                    placeholder="Ej: 4"
                    className="mt-1 w-full rounded-xl border border-border px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-expense">{error}</p>}

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-accent py-3 text-white font-medium hover:bg-accentDark transition disabled:opacity-60"
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
