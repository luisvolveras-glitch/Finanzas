import Link from 'next/link';
import { removeBudgetItem } from '@/app/presupuesto/actions';
import { formatMoney } from '@/lib/format';
import type { BudgetRow } from '@/lib/db';
import EditBudgetButton from './EditBudgetButton';

export default function BudgetTable({ rows }: { rows: BudgetRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="bg-card rounded-xl2 shadow-soft p-6 text-center text-muted text-sm">
        Aún no has agregado ítems de presupuesto. Usa el botón + para agregar el primero.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl2 shadow-soft p-4 overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="text-left text-muted">
            <th className="pb-2 pl-2 font-medium">Nombre</th>
            <th className="pb-2 font-medium">Detalle</th>
            <th className="pb-2 font-medium">Día / frecuencia</th>
            <th className="pb-2 font-medium text-right">Monto</th>
            <th className="pb-2 font-medium text-right">Pagado</th>
            <th className="pb-2 pr-2 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => {
            const isPaid = row.paidCents >= row.amountCents;
            return (
              <tr key={row.key}>
                <td className="py-2.5 pl-2 text-ink whitespace-nowrap">{row.name}</td>
                <td className="py-2.5 text-ink">{row.detail}</td>
                <td className="py-2.5 text-muted whitespace-nowrap">{row.frequency}</td>
                <td className="py-2.5 text-right font-medium text-ink whitespace-nowrap">
                  {formatMoney(row.amountCents)}
                </td>
                <td
                  className={`py-2.5 text-right font-medium whitespace-nowrap ${
                    isPaid ? 'text-income' : 'text-muted'
                  }`}
                >
                  {formatMoney(row.paidCents)}
                </td>
                <td className="py-2.5 pr-2 text-right whitespace-nowrap">
                  {row.itemId ? (
                    <>
                      <EditBudgetButton
                        item={{
                          id: row.itemId,
                          name: row.name,
                          detail: row.detail,
                          frequency: row.frequency,
                          amount: row.amountCents / 100,
                        }}
                      />
                      <form action={removeBudgetItem.bind(null, row.itemId)} className="inline">
                        <button
                          aria-label="Eliminar ítem"
                          className="text-muted hover:text-expense px-1"
                        >
                          🗑️
                        </button>
                      </form>
                    </>
                  ) : row.cardId ? (
                    <Link href="/tarjetas" className="text-xs font-medium text-accent">
                      Ver tarjeta
                    </Link>
                  ) : (
                    <Link href="/deudas" className="text-xs font-medium text-accent">
                      Ver deuda
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
