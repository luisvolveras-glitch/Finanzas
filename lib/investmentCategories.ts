export interface InvestmentCategory {
  id: string;
  label: string;
  icon: string;
}

export const INVESTMENT_CATEGORIES: InvestmentCategory[] = [
  { id: 'inversion', label: 'Inversión', icon: '📈' },
  { id: 'ahorro', label: 'Ahorro', icon: '💰' },
  { id: 'cdt', label: 'CDT / Depósito a plazo', icon: '🏦' },
  { id: 'fondo', label: 'Fondo de inversión', icon: '📊' },
  { id: 'acciones', label: 'Acciones / Bolsa', icon: '📉' },
  { id: 'cripto', label: 'Cripto', icon: '₿' },
  { id: 'otro_inversion', label: 'Otro', icon: '🔖' },
];

export function getInvestmentCategory(id: string): InvestmentCategory {
  return (
    INVESTMENT_CATEGORIES.find((c) => c.id === id) ?? {
      id,
      label: id || 'Otro',
      icon: '🔖',
    }
  );
}

export function resolveInvestmentCategoryId(input?: string): string {
  if (!input || !input.trim()) return 'otro_inversion';
  const normalized = input.trim().toLowerCase();
  const found = INVESTMENT_CATEGORIES.find(
    (c) => c.id === normalized || c.label.toLowerCase() === normalized
  );
  return found ? found.id : input.trim();
}
