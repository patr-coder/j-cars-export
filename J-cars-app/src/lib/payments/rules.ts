type PaymentLike = { amount: number; status: string };

// Summed in integer cents so repeated partial payments can't drift and
// leave an order a fraction of a cent short of "paid".
function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function verifiedTotal(payments: readonly PaymentLike[]): number {
  const cents = payments
    .filter((p) => p.status === "verified")
    .reduce((sum, p) => sum + toCents(p.amount), 0);
  return cents / 100;
}

export function isFullyPaid(totalUsd: number, payments: readonly PaymentLike[]): boolean {
  return toCents(verifiedTotal(payments)) >= toCents(totalUsd);
}

export function remainingBalance(totalUsd: number, payments: readonly PaymentLike[]): number {
  return Math.max(0, toCents(totalUsd) - toCents(verifiedTotal(payments))) / 100;
}
