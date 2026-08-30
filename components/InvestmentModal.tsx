'use client';

import { useState, useTransition } from 'react';
import { createInvestment, editInvestment } from '@/app/inversiones/actions';
import { INVESTMENT_CATEGORIES } from '@/lib/investmentCategories';
import { todayISO } from '@/lib/format';

export interface EditableInvestment {
  id: number;
  category: string;
  name: string;
  amount: number;
  interestRate: number | null;
  date: string;
}

export default function InvestmentModal({
  trigger,
  initial,
}: {
  trigger: (open: () => void) => React.ReactNode;
  initial?: EditableInvestment;
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
          await editInvestment(initial.id, formData);
        } else {
          await createInvestment(formData);
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
                {initial ? 'Editar inversión' : 'Nueva inversión / ahorro'}
              </h2>
              <button onClick={close} className="text-muted text-xl leading-none">
                ×
              </button>
            </div>

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted">Categoría</label>
                <select
                  name="category"
                  defaultValue={initial?.category}
                  className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {INVESTMENT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted">Nombre</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={initial?.name}
                  placeholder="Ej: CDT Bancolombia, Fondo XYZ..."
                  className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted">Monto</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  defaultValue={initial?.amount}
                  placeholder="0.00"
                  className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-lg font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted">
                  Tasa de interés anual % (opcional)
                </label>
                <input
                  name="interestRate"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={initial?.interestRate ?? undefined}
                  placeholder="Ej: 10.5"
                  className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted">Fecha</label>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={initial?.date ?? todayISO()}
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
