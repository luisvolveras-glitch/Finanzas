import { getCategory } from '@/lib/categories';
import { formatMoney } from '@/lib/format';
import type { CategoryTotalRow } from '@/lib/db';

export default function CategoryBars({ rows }: { rows: CategoryTotalRow[] }) {
  const expenses = rows.filter((r) => r.type === 'expense').slice(0, 6);

  if (expenses.length === 0) {
    return (
      <div className="bg-card rounded-xl2 shadow-soft p-6 text-center text-muted text-sm">
        Aún no hay gastos registrados este mes.
      </div>
    );
  }

  const max = Math.max(...expenses.map((r) => r.total_cents));

  return (
    <div className="bg-card rounded-xl2 shadow-soft p-6">
      <h3 className="text-sm font-medium text-muted mb-4">Gastos por categoría</h3>
      <div className="flex items-end gap-3 h-40 overflow-x-auto">
        {expenses.map((r, i) => {
          const cat = getCategory(r.category);
          const heightPct = Math.max((r.total_cents / max) * 100, 8);
          return (
            <div key={r.category} className="flex flex-col items-center justify-end h-full min-w-[64px]">
              <div className="flex-1 flex items-end w-full">
                <div
                  className={`w-full rounded-2xl ${i === 0 ? 'bg-accent' : 'bg-bg'}`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <div className="mt-2 text-lg">{cat.icon}</div>
              <div className="text-xs font-semibold text-ink">{formatMoney(r.total_cents)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
