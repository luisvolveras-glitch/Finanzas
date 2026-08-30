export function formatMoney(cents: number): string {
  const value = cents / 100;
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('es-CO', {
    maximumFractionDigits: 0,
  });
  return `${sign}$${formatted}`;
}

export function formatUSD(cents: number): string {
  const value = cents / 100;
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}US$${formatted}`;
}

export function formatByCurrency(cents: number, currency: 'COP' | 'USD'): string {
  return currency === 'USD' ? formatUSD(cents) : formatMoney(cents);
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function monthLabel(month: string): string {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1, 1);
  const label = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function addMonths(month: string, delta: number): string {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthWindow(center: string, monthsBack: number, monthsForward: number): string[] {
  const result: string[] = [];
  for (let i = monthsForward; i >= -monthsBack; i--) {
    result.push(addMonths(center, i));
  }
  return result;
}
