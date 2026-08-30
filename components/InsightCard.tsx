import type { Insight } from '@/lib/insights';

const TONE_STYLES: Record<Insight['tone'], string> = {
  positive: 'border-income',
  warning: 'border-expense',
  info: 'border-accent',
};

export default function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div
      className={`bg-card rounded-xl2 shadow-soft p-5 border-l-4 ${TONE_STYLES[insight.tone]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none">{insight.icon}</span>
        <div className="min-w-0">
          <h3 className="font-semibold text-ink">{insight.title}</h3>
          <p className="mt-1 text-sm text-muted">{insight.text}</p>
        </div>
      </div>
    </div>
  );
}
