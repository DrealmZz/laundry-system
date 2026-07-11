export function formatCurrency(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Rp0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp0';
  return `Rp${num.toLocaleString('id-ID')}`;
}
