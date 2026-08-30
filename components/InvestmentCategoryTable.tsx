import { getInvestmentCategory } from '@/lib/investmentCategories';
import { formatMoney } from '@/lib/format';
import type { InvestmentCategoryTotalRow } from '@/lib/db';

export default function InvestmentCategoryTable({ rows }: { rows: InvestmentCategoryTotalRow[] }) {
  return (
    <div className="bg-card rounded-xl2 shadow-soft p-6 overflow-x-auto">
      <h3 className="text-sm font-medium text-muted mb-4">Por categoría</h3>
      {rows.length === 0 ? (
        <p className="text-center text-muted text-sm py-4">Todavía no hay datos.</p>
      ) : (
        <table className="w-full min-w-[360px] text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="pb-2 font-medium">Categoría</th>
              <th className="pb-2 font-medium text-right">Registros</th>
              <th className="pb-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => {
              const cat = getInvestmentCategory(r.category);
              return (
                <tr key={r.category}>
                  <td className="py-2.5 text-ink">
                    {cat.icon} {cat.label}
                  </td>
                  <td className="py-2.5 text-right text-muted">{r.count}</td>
                  <td className="py-2.5 text-right font-medium text-accent">
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
