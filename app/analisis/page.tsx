import { computeInsights } from '@/lib/insights';
import { monthLabel, currentMonth } from '@/lib/format';
import { requireWorkspaceId } from '@/lib/session';
import InsightCard from '@/components/InsightCard';
import BottomNav from '@/components/BottomNav';
import { logout } from '../login/actions';

export const dynamic = 'force-dynamic';

export default async function AnalisisPage() {
  const workspaceId = await requireWorkspaceId();
  const insights = computeInsights(workspaceId);

  return (
    <main className="min-h-screen pb-32">
      <div className="mx-auto max-w-md px-4 pt-8 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-ink">Análisis</h1>
          <form action={logout}>
            <button className="text-muted text-lg" aria-label="Cerrar sesión">
              ⏻
            </button>
          </form>
        </div>

        <p className="px-1 text-sm text-muted">
          Consejos de ahorro e inversión calculados a partir de tus movimientos de{' '}
          {monthLabel(currentMonth())}.
        </p>

        <section className="space-y-3">
          {insights.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
