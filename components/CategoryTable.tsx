import { getCategory } from '@/lib/categories';
import { formatMoney } from '@/lib/format';
import type { CategoryTotalRow } from '@/lib/db';

export default function CategoryTable({ rows }: { rows: CategoryTotalRow[] }) {
  return (
    <div className="bg-card rounded-xl2 shadow-soft p-6 overflow-x-auto">
      <h3 className="text-sm font-medium text-muted mb-4">Por categoría (mes seleccionado)</h3>
      {rows.length === 0 ? (
        <p className="text-center text-muted text-sm py-4">Todavía no hay datos.</p>
      ) : (
        <table className="w-full min-w-[380px] text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="pb-2 font-medium">Categoría</th>
              <th className="pb-2 font-medium">Tipo</th>
              <th className="pb-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => {
              const cat = getCategory(r.category);
              const isIncome = r.type === 'income';
              return (
                <tr key={`${r.type}-${r.category}`}>
                  <td className="py-2.5 text-ink">
                    {cat.icon} {cat.label}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        isIncome ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
                      }`}
                    >
                      {isIncome ? 'Ingreso' : 'Gasto'}
                    </span>
                  </td>
                  <td className={`py-2.5 text-right font-medium ${isIncome ? 'text-income' : 'text-expense'}`}>
                    {formatMoney(r.total_cents)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
