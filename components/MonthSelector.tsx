'use client';

import { useRouter } from 'next/navigation';
import { monthLabel } from '@/lib/format';

export default function MonthSelector({
  month,
  months,
}: {
  month: string;
  months: string[];
}) {
  const router = useRouter();
  const options = months.includes(month) ? months : [month, ...months];

  return (
    <select
      value={month}
      onChange={(e) => router.push(`/?month=${e.target.value}`)}
      className="rounded-full bg-pillDark text-white text-sm font-medium px-4 py-2 focus:outline-none appearance-none"
    >
      {options.map((m) => (
        <option key={m} value={m} className="text-ink">
          {monthLabel(m)}
        </option>
      ))}
    </select>
  );
}
