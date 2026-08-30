import { formatMoney, monthLabel } from '@/lib/format';
import type { MonthlySummaryRow } from '@/lib/db';

export default function MonthlySummaryTable({ rows }: { rows: MonthlySummaryRow[] }) {
  return (
    <div className="bg-card rounded-xl2 shadow-soft p-6 overflow-x-auto">
      <h3 className="text-sm font-medium text-muted mb-4">Ingresos vs. gastos por mes</h3>
      {rows.length === 0 ? (
        <p className="text-center text-muted text-sm py-4">Todavía no hay datos.</p>
      ) : (
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="pb-2 font-medium">Mes</th>
              <th className="pb-2 font-medium text-right">Ingresos</th>
              <th className="pb-2 font-medium text-right">Gastos</th>
              <th className="pb-2 font-medium text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => {
              const balance = r.income_cents - r.expense_cents;
              return (
                <tr key={r.month}>
                  <td className="py-2.5 text-ink">{monthLabel(r.month)}</td>
                  <td className="py-2.5 text-right text-income">{formatMoney(r.income_cents)}</td>
                  <td className="py-2.5 text-right text-expense">{formatMoney(r.expense_cents)}</td>
                  <td
                    className={`py-2.5 text-right font-medium ${
                      balance >= 0 ? 'text-ink' : 'text-expense'
                    }`}
                  >
                    {formatMoney(balance)}
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
