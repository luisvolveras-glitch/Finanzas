'use client';

import { useState, useTransition } from 'react';
import { createTransaction, editTransaction } from '@/app/actions';
import { categoriesByType, type TxType } from '@/lib/categories';
import { todayISO } from '@/lib/format';

export interface EditableTransaction {
  id: number;
  type: TxType;
  amount: number;
  detail: string;
  category: string;
  date: string;
}

export default function TransactionModal({
  trigger,
  initial,
}: {
  trigger: (open: () => void) => React.ReactNode;
  initial?: EditableTransaction;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TxType>(initial?.type ?? 'expense');
  const [category, setCategory] = useState(
    initial?.category ?? categoriesByType(initial?.type ?? 'expense')[0].id
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const categories = categoriesByType(type);
  const isOtherCategory = category === 'otro_ingreso' || category === 'otro_gasto';

  function selectType(nextType: TxType) {
    setType(nextType);
    setCategory(categoriesByType(nextType)[0].id);
  }

  function close() {
    setOpen(false);
    setError(null);
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        if (initial) {
          await editTransaction(initial.id, formData);
        } else {
          await createTransaction(formData);
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
                {initial ? 'Editar movimiento' : 'Nuevo movimiento'}
              </h2>
              <button onClick={close} className="text-muted text-xl leading-none">
                ×
              </button>
            </div>

            <div className="flex rounded-xl bg-bg p-1">
              <button
                type="button"
                onClick={() => selectType('expense')}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                  type === 'expense' ? 'bg-expense text-white shadow-soft' : 'text-muted'
                }`}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => selectType('income')}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                  type === 'income' ? 'bg-income text-white shadow-soft' : 'text-muted'
                }`}
              >
                Ingreso
              </button>
            </div>

            <form action={handleSubmit} className="space-y-4">
              <input type="hidden" name="type" value={type} />

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
                  className="mt-1 w-full rounded-xl border border-border px-4 py-3 text-lg font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted">Categoría</label>
                <select
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted">
                  {isOtherCategory ? 'Detalle (especifica de qué se trata)' : 'Detalle'}
                </label>
                <input
                  name="detail"
                  type="text"
                  required
                  defaultValue={initial?.detail}
                  placeholder={
                    isOtherCategory
                      ? 'Ej: bono, préstamo, venta de algo, reembolso...'
                      : '¿En qué fue?'
                  }
                  className="mt-1 w-full rounded-xl border border-border px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted">Fecha</label>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={initial?.date ?? todayISO()}
                  className="mt-1 w-full rounded-xl border border-border px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
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
