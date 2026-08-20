// AEG display standards. Em dash is the universal null - never render
// null, NaN, 0 or blank for missing data.
export const DASH = '—';

const MONEY = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD',
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});
const COUNT = new Intl.NumberFormat('en-US');

const bad = (v) => v === null || v === undefined || Number.isNaN(Number(v));

/** Exact to the penny, thousands separators. */
export function money(v) {
  return bad(v) ? DASH : MONEY.format(Number(v));
}

/** Compact form for chart axes: $1.9M, $324K, $450 */
export function moneyShort(v) {
  if (bad(v)) return DASH;
  const n = Number(v);
  const a = Math.abs(n);
  if (a >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (a >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
}

export function count(v) {
  return bad(v) ? DASH : COUNT.format(Number(v));
}

/** Two decimals, always. Pass 12.5 for "12.50%". */
export function percent(v) {
  return bad(v) ? DASH : `${Number(v).toFixed(2)}%`;
}

/** MM/DD/YYYY */
export function mdy(v) {
  if (!v) return DASH;
  const d = new Date(`${String(v).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return DASH;
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}/${p(d.getDate())}/${d.getFullYear()}`;
}

/** MM/YYYY */
export function periodMY(v) {
  if (!v) return DASH;
  const d = new Date(`${String(v).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return DASH;
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

/** "Data as of" chip. Degrades to "unknown", never throws. */
export function dataAsOf(v) {
  if (!v) return 'unknown';
  const s = String(v);
  const d = new Date(s.length <= 10 ? `${s}T00:00:00` : s);
  if (Number.isNaN(d.getTime())) return 'unknown';
  const p = (n) => String(n).padStart(2, '0');
  const date = `${p(d.getMonth() + 1)}/${p(d.getDate())}/${d.getFullYear()}`;
  return s.length <= 10 ? date : `${date} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function days(v) {
  return bad(v) ? DASH : `${count(v)}d`;
}
