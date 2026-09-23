import Link from "next/link";

import { PaymentRow } from "@/components/orders/order-panels";
import { PaymentReviewActions } from "@/components/orders/payment-review-actions";
import { requireRole } from "@/lib/auth/roles";
import { formatCurrency } from "@/lib/currency/format";
import { getAdminPayments } from "@/lib/payments/queries";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "pending", label: "To review" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
] as const;

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  // The /admin layout also admits inventory_manager; payments are sales/admin only.
  await requireRole(["admin", "sales"]);
  const { status: rawStatus, error } = await searchParams;
  const status = TABS.some((t) => t.value === rawStatus) ? rawStatus! : "pending";
  const payments = await getAdminPayments({ status });

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Check each proof against the bank account before verifying it.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <nav className="flex gap-1 border-b" aria-label="Payment status">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/payments?status=${tab.value}`}
            aria-current={tab.value === status ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm",
              tab.value === status
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing here.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {payments.map((payment) => (
            <li key={payment.id} className="rounded-xl border p-4">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <Link href={`/admin/orders/${payment.orderId}`} className="font-medium text-primary hover:underline">
                  {payment.orderNo}
                </Link>
                <span className="text-muted-foreground">
                  {payment.clientLabel} · order total {formatCurrency(payment.orderTotalUsd)}
                </span>
              </div>
              <ul>
                <PaymentRow payment={payment}>
                  {payment.status === "pending" && (
                    <PaymentReviewActions paymentId={payment.id} returnTo="/admin/payments" />
                  )}
                </PaymentRow>
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
