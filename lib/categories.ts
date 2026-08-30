export type TxType = 'income' | 'expense';

export interface Category {
  id: string;
  label: string;
  icon: string;
  type: TxType;
}

export const CATEGORIES: Category[] = [
  // Ingresos
  { id: 'salario', label: 'Salario', icon: '💼', type: 'income' },
  { id: 'freelance', label: 'Freelance', icon: '💻', type: 'income' },
  { id: 'inversiones', label: 'Inversiones', icon: '📈', type: 'income' },
  { id: 'regalo', label: 'Regalo', icon: '🎁', type: 'income' },
  { id: 'otro_ingreso', label: 'Otro ingreso', icon: '💰', type: 'income' },
  // Gastos
  { id: 'comida', label: 'Comida', icon: '🍔', type: 'expense' },
  { id: 'transporte', label: 'Transporte', icon: '🚗', type: 'expense' },
  { id: 'vivienda', label: 'Vivienda', icon: '🏠', type: 'expense' },
  { id: 'servicios', label: 'Servicios', icon: '💡', type: 'expense' },
  { id: 'entretenimiento', label: 'Entretenimiento', icon: '🎮', type: 'expense' },
  { id: 'salud', label: 'Salud', icon: '💊', type: 'expense' },
  { id: 'compras', label: 'Compras', icon: '🛍️', type: 'expense' },
  { id: 'educacion', label: 'Educación', icon: '📚', type: 'expense' },
  { id: 'otro_gasto', label: 'Otro gasto', icon: '🔖', type: 'expense' },
];

export function getCategory(id: string): Category {
  return (
    CATEGORIES.find((c) => c.id === id) ?? {
      id,
      label: id || 'Otro',
      icon: '🔖',
      type: 'expense',
    }
  );
}

export function categoriesByType(type: TxType): Category[] {
  return CATEGORIES.filter((c) => c.type === type);
}

export function resolveCategoryId(type: TxType, input?: string): string {
  if (!input || !input.trim()) return type === 'income' ? 'otro_ingreso' : 'otro_gasto';
  const normalized = input.trim().toLowerCase();
  const found = CATEGORIES.find(
    (c) => c.type === type && (c.id === normalized || c.label.toLowerCase() === normalized)
  );
  return found ? found.id : input.trim();
}
