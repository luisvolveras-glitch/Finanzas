import { removeBudgetItem } from '@/app/presupuesto/actions';
import { formatMoney } from '@/lib/format';
import type { BudgetItem } from '@/lib/db';
import EditBudgetButton from './EditBudgetButton';

export default function BudgetTable({ items }: { items: BudgetItem[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-card rounded-xl2 shadow-soft p-6 text-center text-muted text-sm">
        Aún no has agregado ítems de presupuesto. Usa el botón + para agregar el primero.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl2 shadow-soft p-4 overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="text-left text-muted">
            <th className="pb-2 pl-2 font-medium">Nombre</th>
            <th className="pb-2 font-medium">Detalle</th>
            <th className="pb-2 font-medium">Día / frecuencia</th>
            <th className="pb-2 font-medium text-right">Monto</th>
            <th className="pb-2 pr-2 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="py-2.5 pl-2 text-ink whitespace-nowrap">{item.name}</td>
              <td className="py-2.5 text-ink">{item.detail}</td>
              <td className="py-2.5 text-muted whitespace-nowrap">{item.frequency}</td>
              <td className="py-2.5 text-right font-medium text-ink whitespace-nowrap">
                {formatMoney(item.amount_cents)}
              </td>
              <td className="py-2.5 pr-2 text-right whitespace-nowrap">
                <EditBudgetButton
                  item={{
                    id: item.id,
                    name: item.name,
                    detail: item.detail,
                    frequency: item.frequency,
                    amount: item.amount_cents / 100,
                  }}
                />
                <form action={removeBudgetItem.bind(null, item.id)} className="inline">
                  <button aria-label="Eliminar ítem" className="text-muted hover:text-expense px-1">
                    🗑️
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
