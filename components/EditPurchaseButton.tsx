'use client';

import PurchaseModal, { type CardOption, type EditablePurchase } from './PurchaseModal';

export default function EditPurchaseButton({
  purchase,
  cards,
}: {
  purchase: EditablePurchase;
  cards: CardOption[];
}) {
  return (
    <PurchaseModal
      initial={purchase}
      cards={cards}
      trigger={(open) => (
        <button onClick={open} aria-label="Editar compra" className="text-muted hover:text-ink px-1">
          ✏️
        </button>
      )}
    />
  );
}
