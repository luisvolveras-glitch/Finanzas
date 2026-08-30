import { removeCard, removePurchase } from '@/app/tarjetas/actions';
import { currentMonth, formatMoney, monthsBetween } from '@/lib/format';
import type { CreditCard, CreditCardPurchase } from '@/lib/db';
import EditCardButton from './EditCardButton';
import EditPurchaseButton from './EditPurchaseButton';
import type { CardOption } from './PurchaseModal';

export default function CreditCardTile({
  card,
  purchases,
  monthlyDue,
  paidThisMonth,
  cardOptions,
}: {
  card: CreditCard;
  purchases: CreditCardPurchase[];
  monthlyDue: number;
  paidThisMonth: number;
  cardOptions: CardOption[];
}) {
  const month = currentMonth();

  return (
    <div className="bg-card rounded-xl2 shadow-soft p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{card.name}</p>
          {card.last_four && (
            <p className="text-sm text-muted truncate">Terminada en {card.last_four}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <EditCardButton card={{ id: card.id, name: card.name, lastFour: card.last_four }} />
          <form action={removeCard.bind(null, card.id)}>
            <button aria-label="Eliminar tarjeta" className="text-muted hover:text-expense px-1">
              🗑️
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted">Pago de este mes</p>
          <p className="text-sm font-semibold text-ink">{formatMoney(monthlyDue)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted">Pagado</p>
          <p className="text-sm font-semibold text-income">{formatMoney(paidThisMonth)}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted mb-2">Compras y cuotas</p>
        {purchases.length === 0 ? (
          <p className="text-xs text-muted">
            Aún no has registrado compras con esta tarjeta. Usa el botón + para agregar la primera.
          </p>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {purchases.map((p) => {
              const firstMonth = p.date.slice(0, 7);
              const elapsed = monthsBetween(firstMonth, month);
              const currentInstallment = elapsed + 1;
              const status =
                currentInstallment < 1
                  ? 'Empieza próximo mes'
                  : currentInstallment > p.installments
                    ? 'Finalizada'
                    : `Cuota ${currentInstallment} de ${p.installments}`;
              const installmentCents = Math.round(p.total_cents / p.installments);
              return (
                <div key={p.id} className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ink">{p.detail}</p>
                    <p className="text-muted">
                      {formatMoney(p.total_cents)} · {status}
                    </p>
                  </div>
                  <p className="shrink-0 font-medium text-expense">{formatMoney(installmentCents)}</p>
                  <div className="flex shrink-0 items-center gap-1">
                    <EditPurchaseButton
                      purchase={{
                        id: p.id,
                        cardId: p.card_id,
                        detail: p.detail,
                        amount: p.total_cents / 100,
                        installments: p.installments,
                        date: p.date,
                      }}
                      cards={cardOptions}
                    />
                    <form action={removePurchase.bind(null, p.id)}>
                      <button
                        aria-label="Eliminar compra"
                        className="text-muted hover:text-expense px-1"
                      >
                        🗑️
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
