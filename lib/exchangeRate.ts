const CACHE_MS = 60 * 60 * 1000;

let cached: { rate: number; fetchedAt: number } | null = null;

export async function getUsdToCopRate(): Promise<number | null> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_MS) {
    return cached.rate;
  }
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return cached?.rate ?? null;
    const data = (await res.json()) as { rates?: Record<string, number> };
    const rate = data.rates?.COP;
    if (typeof rate !== 'number' || !Number.isFinite(rate)) return cached?.rate ?? null;
    cached = { rate, fetchedAt: Date.now() };
    return rate;
  } catch {
    return cached?.rate ?? null;
  }
}
