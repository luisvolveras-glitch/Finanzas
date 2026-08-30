'use client';

import CardModal, { type EditableCard } from './CardModal';

export default function EditCardButton({ card }: { card: EditableCard }) {
  return (
    <CardModal
      initial={card}
      trigger={(open) => (
        <button onClick={open} aria-label="Editar tarjeta" className="text-muted hover:text-ink px-1">
          ✏️
        </button>
      )}
    />
  );
}
