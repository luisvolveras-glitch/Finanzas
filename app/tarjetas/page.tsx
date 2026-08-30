import {
  getCreditCardMonthlyDue,
  getCreditCardPaidTotal,
  listCreditCardPurchases,
  listCreditCards,
} from '@/lib/db';
import { currentMonth, formatMoney } from '@/lib/format';
import { getCurrentUser } from '@/lib/session';
import AddCardButton from '@/components/AddCardButton';
import AddPurchaseButton from '@/components/AddPurchaseButton';
import CreditCardTile from '@/components/CreditCardTile';
import BottomNav from '@/components/BottomNav';
import AccountHeaderLink from '@/components/AccountHeaderLink';
import { logout } from '../login/actions';

export const dynamic = 'force-dynamic';

export default async function TarjetasPage() {
  const user = await getCurrentUser();
  const workspaceId = user!.workspace_id;
  const month = currentMonth();
  const cards = listCreditCards(workspaceId);
  const cardOptions = cards.map((c) => ({
    id: c.id,
    label: c.last_four ? `${c.name} - ${c.last_four}` : c.name,
  }));

  const rows = cards.map((card) => ({
    card,
    purchases: listCreditCardPurchases(card.id, workspaceId),
    monthlyDue: getCreditCardMonthlyDue(card.id, workspaceId, month),
    paidThisMonth: getCreditCardPaidTotal(card.id, workspaceId, month),
  }));
  const totalDue = rows.reduce((sum, r) => sum + r.monthlyDue, 0);
  const totalPaid = rows.reduce((sum, r) => sum + r.paidThisMonth, 0);

  return (
    <main className="min-h-screen pb-32">
      <div className="mx-auto max-w-md px-4 pt-8 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-ink">Tarjetas de crédito</h1>
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
            <span className="h-2 w-2 rounded-full bg-expense" />
            Pago total de tarjetas este mes
          </div>
          <p className="mt-1 text-4xl font-bold text-ink">{formatMoney(totalDue)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-income/10 px-3 py-1.5 text-sm font-medium text-income">
              Pagado {formatMoney(totalPaid)}
            </span>
          </div>
          <p className="mt-3 text-xs text-muted">
            Al registrar en Movimientos un gasto marcado como pago de una tarjeta, aparece reflejado
            aquí y en Presupuesto.
          </p>
        </section>

        <div className="flex justify-end">
          <AddCardButton />
        </div>

        <section className="space-y-3">
          {rows.length === 0 ? (
            <div className="bg-card rounded-xl2 shadow-soft p-6 text-center text-muted text-sm">
              Aún no has agregado tarjetas. Usa el botón &quot;+ Nueva tarjeta&quot; para agregar la
              primera.
            </div>
          ) : (
            rows.map(({ card, purchases, monthlyDue, paidThisMonth }) => (
              <CreditCardTile
                key={card.id}
                card={card}
                purchases={purchases}
                monthlyDue={monthlyDue}
                paidThisMonth={paidThisMonth}
                cardOptions={cardOptions}
              />
            ))
          )}
        </section>
      </div>

      <AddPurchaseButton cards={cardOptions} />
      <BottomNav />
    </main>
  );
}
