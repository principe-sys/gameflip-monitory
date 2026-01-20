export function formatMoneyUSD(raw: unknown): string {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return '—';

  // Heurística: si viene entero grande => centavos
  const value = Number.isInteger(n) && n >= 1000 ? n / 100 : n;
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

export function formatDate(raw: unknown): string {
  const d = raw ? new Date(String(raw)) : null;
  if (!d || Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}
