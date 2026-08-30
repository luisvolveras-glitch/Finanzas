import {
  getCategoryTotals,
  getInvestmentTotals,
  getMonthlySummary,
  getTotals,
} from './db';
import { getCategory } from './categories';
import { formatMoney, currentMonth } from './format';

export type InsightTone = 'positive' | 'warning' | 'info';

export interface Insight {
  icon: string;
  title: string;
  text: string;
  tone: InsightTone;
}

const DISCRETIONARY_CATEGORIES = ['entretenimiento', 'compras', 'otro_gasto'];
const DISCRETIONARY_THRESHOLD_PCT = 20;
const TOP_CATEGORY_WARNING_PCT = 30;
const MONTH_CHANGE_THRESHOLD_PCT = 15;

export function computeInsights(workspaceId: number): Insight[] {
  const insights: Insight[] = [];
  const month = currentMonth();
  const totals = getTotals(workspaceId, month);
  const balance = totals.income_cents - totals.expense_cents;
  const categoryTotals = getCategoryTotals(workspaceId, month).filter((r) => r.type === 'expense');
  const totalExpense = totals.expense_cents;

  // 1. Tasa de ahorro
  if (totals.income_cents === 0) {
    insights.push({
      icon: '💡',
      tone: 'info',
      title: 'Registra tus ingresos del mes',
      text: 'Aún no tienes ingresos registrados este mes, así que no podemos calcular tu tasa de ahorro todavía.',
    });
  } else {
    const savingsRate = (balance / totals.income_cents) * 100;
    if (savingsRate < 0) {
      insights.push({
        icon: '⚠️',
        tone: 'warning',
        title: 'Este mes gastaste más de lo que ingresó',
        text: `Tus gastos superan tus ingresos en ${formatMoney(
          Math.abs(balance)
        )}. Vale la pena revisar en qué se está yendo el dinero antes de que se acumule.`,
      });
    } else if (savingsRate >= 20) {
      insights.push({
        icon: '🎉',
        tone: 'positive',
        title: '¡Buen ritmo de ahorro!',
        text: `Este mes estás ahorrando cerca del ${savingsRate.toFixed(
          0
        )}% de tus ingresos (${formatMoney(balance)}). Considera destinar parte de ese excedente a una inversión o fondo de ahorro.`,
      });
    } else {
      insights.push({
        icon: '📊',
        tone: 'info',
        title: 'Tasa de ahorro moderada',
        text: `Estás ahorrando cerca del ${savingsRate.toFixed(
          0
        )}% de tus ingresos este mes. Un objetivo común es apuntar a un 20%; revisar tus gastos discrecionales puede ayudarte a acercarte.`,
      });
    }
  }

  // 2. Categorías discrecionales altas (posible gasto innecesario)
  const flaggedIds = new Set<string>();
  if (totalExpense > 0) {
    for (const row of categoryTotals) {
      if (!DISCRETIONARY_CATEGORIES.includes(row.category)) continue;
      const pct = (row.total_cents / totalExpense) * 100;
      if (pct >= DISCRETIONARY_THRESHOLD_PCT) {
        const cat = getCategory(row.category);
        flaggedIds.add(row.category);
        insights.push({
          icon: '🔎',
          tone: 'warning',
          title: `Posible gasto reducible en ${cat.label}`,
          text: `${cat.label} representa el ${pct.toFixed(0)}% de tus gastos de este mes (${formatMoney(
            row.total_cents
          )}). Si no es un gasto esencial, revisa si hay algo que puedas recortar ahí.`,
        });
      }
    }
  }

  // 3. Categoría con mayor gasto (si no fue ya señalada arriba)
  if (categoryTotals.length > 0 && totalExpense > 0) {
    const top = categoryTotals[0];
    if (!flaggedIds.has(top.category)) {
      const cat = getCategory(top.category);
      const pct = (top.total_cents / totalExpense) * 100;
      insights.push({
        icon: pct >= TOP_CATEGORY_WARNING_PCT ? '🔎' : 'ℹ️',
        tone: pct >= TOP_CATEGORY_WARNING_PCT ? 'warning' : 'info',
        title: `Tu mayor gasto fue en ${cat.label}`,
        text: `Representa el ${pct.toFixed(0)}% de tus gastos del mes (${formatMoney(
          top.total_cents
        )}).${
          pct >= TOP_CATEGORY_WARNING_PCT
            ? ' Si no es un gasto fijo, podría ser un buen lugar para recortar.'
            : ''
        }`,
      });
    }
  }

  // 4. Comparación con el mes anterior
  const monthly = getMonthlySummary(workspaceId, 2);
  if (monthly.length >= 2) {
    const [curr, prev] = monthly;
    if (prev.expense_cents > 0) {
      const change = ((curr.expense_cents - prev.expense_cents) / prev.expense_cents) * 100;
      if (change >= MONTH_CHANGE_THRESHOLD_PCT) {
        insights.push({
          icon: '📈',
          tone: 'warning',
          title: 'Tus gastos subieron respecto al mes pasado',
          text: `Gastaste un ${change.toFixed(0)}% más que el mes anterior. Compara tus categorías para ver de dónde vino el aumento.`,
        });
      } else if (change <= -MONTH_CHANGE_THRESHOLD_PCT) {
        insights.push({
          icon: '👏',
          tone: 'positive',
          title: 'Redujiste tus gastos respecto al mes pasado',
          text: `Gastaste un ${Math.abs(change).toFixed(0)}% menos que el mes anterior. ¡Sigue así!`,
        });
      }
    }
  }

  // 5. Inversiones y ahorro
  const invTotals = getInvestmentTotals(workspaceId);
  if (invTotals.total_cents === 0) {
    insights.push({
      icon: '🌱',
      tone: 'info',
      title: 'Aún no registras inversiones o ahorros',
      text: 'Considera apartar una parte de tu excedente mensual en un fondo de ahorro o inversión, aunque sea un monto pequeño para empezar.',
    });
  } else {
    const rateText =
      invTotals.weighted_rate !== null
        ? ` con una tasa promedio ponderada de ${invTotals.weighted_rate.toFixed(
            2
          )}% anual. Compárala con la inflación de tu país para saber si tu dinero está creciendo en términos reales.`
        : '.';
    insights.push({
      icon: '💰',
      tone: 'info',
      title: `Llevas ${formatMoney(invTotals.total_cents)} en inversiones y ahorros`,
      text: `Están distribuidos en tus registros de inversión${rateText}`,
    });
  }

  return insights;
}
