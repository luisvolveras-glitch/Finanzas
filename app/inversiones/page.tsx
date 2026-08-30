import {
  getInvestmentCategoryTotals,
  getInvestmentTotals,
  getInvestmentTotalsUSD,
  listInvestments,
} from '@/lib/db';
import { getUsdToCopRate } from '@/lib/exchangeRate';
import { formatMoney, formatUSD } from '@/lib/format';
import { getCurrentUser } from '@/lib/session';
import AddInvestmentButton from '@/components/AddInvestmentButton';
import InvestmentsList from '@/components/InvestmentsList';
import InvestmentCategoryTable from '@/components/InvestmentCategoryTable';
import BottomNav from '@/components/BottomNav';
import AccountHeaderLink from '@/components/AccountHeaderLink';
import { logout } from '../login/actions';

export const dynamic = 'force-dynamic';

export default async function InversionesPage() {
  const user = await getCurrentUser();
  const workspaceId = user!.workspace_id;
  const investments = listInvestments(workspaceId);
  const totals = getInvestmentTotals(workspaceId);
  const categoryTotals = getInvestmentCategoryTotals(workspaceId);
  const totalsUSD = getInvestmentTotalsUSD(workspaceId);
  const hasUSD = totalsUSD.total_cents > 0;
  const usdRate = hasUSD ? await getUsdToCopRate() : null;

  return (
    <main className="min-h-screen pb-32">
      <div className="mx-auto max-w-md px-4 pt-8 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-ink">Inversiones</h1>
          <div className="flex items-center gap-3">
            <AccountHeaderLink isAdmin={user!.is_admin === 1} />
            <form action={logout}>
              <button className="text-muted text-lg" aria-label="Cerrar sesión">
                ⏻
              </button>
            </form>
          </div>
        </div>

        <section className="bg-card rounded-xl2 shadow-soft p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Total invertido / ahorrado
          </div>
          <p className="mt-1 text-4xl font-bold text-ink">{formatMoney(totals.total_cents)}</p>
          {totals.weighted_rate !== null && (
            <div className="mt-4">
              <span className="rounded-full bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">
                Tasa promedio ponderada: {totals.weighted_rate.toFixed(2)}% anual
              </span>
            </div>
          )}
        </section>

        {hasUSD && (
          <section className="bg-card rounded-xl2 shadow-soft p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Invertido en dólares (aparte del total en pesos)
            </div>
            <p className="mt-1 text-2xl font-bold text-ink">{formatUSD(totalsUSD.total_cents)}</p>
            {totalsUSD.weighted_rate !== null && (
              <span className="mt-2 inline-block rounded-full bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">
                Tasa promedio ponderada: {totalsUSD.weighted_rate.toFixed(2)}% anual
              </span>
            )}
            {usdRate && (
              <p className="mt-3 text-xs text-muted">
                Tasa de referencia: 1 USD ≈ {formatMoney(Math.round(usdRate * 100))}
              </p>
            )}
          </section>
        )}

        <section className="space-y-3">
          <h2 className="px-1 text-sm font-medium text-muted">Movimientos</h2>
          <InvestmentsList investments={investments} />
        </section>

        <section className="space-y-3">
          <h2 className="px-1 text-sm font-medium text-muted">Resumen</h2>
          <InvestmentCategoryTable rows={categoryTotals} />
        </section>
      </div>

      <AddInvestmentButton />
      <BottomNav />
    </main>
  );
}
