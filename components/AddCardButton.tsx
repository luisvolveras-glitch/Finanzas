'use client';

import CardModal from './CardModal';

export default function AddCardButton() {
  return (
    <CardModal
      trigger={(open) => (
        <button
          onClick={open}
          aria-label="Agregar tarjeta"
          className="rounded-full bg-pillDark px-3 py-1.5 text-xs font-medium text-white hover:brightness-105 transition"
        >
          + Nueva tarjeta
        </button>
      )}
    />
  );
}
