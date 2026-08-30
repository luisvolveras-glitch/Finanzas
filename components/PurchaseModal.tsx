'use client';

import { useState, useTransition } from 'react';
import { createPurchase, editPurchase } from '@/app/tarjetas/actions';
import { todayISO } from '@/lib/format';

export interface EditablePurchase {
  id: number;
  cardId: number;
  detail: string;
  amount: number;
  installments: number;
  date: string;
}

export interface CardOption {
  id: number;
  label: string;
}

export default function PurchaseModal({
  trigger,
  initial,
  cards,
}: {
  trigger: (open: () => void) => React.ReactNode;
  initial?: EditablePurchase;
  cards: CardOption[];
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
          await editPurchase(initial.id, formData);
        } else {
          await createPurchase(formData);
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
                {initial ? 'Editar compra' : 'Nueva compra con tarjeta'}
              </h2>
              <button onClick={close} className="text-muted text-xl leading-none">
                ×
              </button>
            </div>

            {cards.length === 0 ? (
              <p className="text-sm text-muted">
                Primero agrega una tarjeta con el botón &quot;+ Nueva tarjeta&quot;.
              </p>
            ) : (
              <form action={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted">Tarjeta</label>
                  <select
                    name="cardId"
                    defaultValue={initial?.cardId}
                    required
                    className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted">Detalle</label>
                  <input
                    name="detail"
                    type="text"
                    required
                    defaultValue={initial?.detail}
                    placeholder="¿Qué compraste?"
                    className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted">Monto total de la compra</label>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted">Número de cuotas</label>
                    <input
                      name="installments"
                      type="number"
                      step="1"
                      min="1"
                      required
                      defaultValue={initial?.installments ?? 1}
                      placeholder="Ej: 6"
                      className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted">Fecha (mes de 1ra cuota)</label>
                    <input
                      name="date"
                      type="date"
                      required
                      defaultValue={initial?.date ?? todayISO()}
                      className="mt-1 w-full rounded-2xl border-0 bg-bg px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
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
            )}
          </div>
        </div>
      )}
    </>
  );
}
