import { signOrderFileUrls } from "@/lib/storage/order-files";
import { createClient } from "@/lib/supabase/server";

export type PaymentItem = {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  reference: string | null;
  status: string;
  rejectionReason: string | null;
  proofUrl: string | null;
  verifiedAt: string | null;
  createdAt: string;
};

export type PendingPaymentItem = PaymentItem & {
  orderNo: string;
  orderTotalUsd: number;
  clientLabel: string;
};

const PAYMENT_COLUMNS =
  "id, order_id, amount, currency, reference, status, rejection_reason, proof_path, verified_at, created_at";

type RawPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  reference: string | null;
  status: string;
  rejection_reason: string | null;
  proof_path: string | null;
  verified_at: string | null;
  created_at: string;
};

function mapPayment(row: RawPayment, urls: Map<string, string>): PaymentItem {
  return {
    id: row.id,
    orderId: row.order_id,
    amount: Number(row.amount),
    currency: row.currency,
    reference: row.reference,
    status: row.status,
    rejectionReason: row.rejection_reason,
    proofUrl: row.proof_path ? (urls.get(row.proof_path) ?? null) : null,
    verifiedAt: row.verified_at,
    createdAt: row.created_at,
  };
}

function proofPaths(rows: RawPayment[]): string[] {
  return rows.map((r) => r.proof_path).filter((p): p is string => Boolean(p));
}

export async function getOrderPayments(orderId: string): Promise<PaymentItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_COLUMNS)
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`getOrderPayments: ${error.message}`);

  const rows = (data as RawPayment[]) ?? [];
  const urls = await signOrderFileUrls(supabase, proofPaths(rows));
  return rows.map((row) => mapPayment(row, urls));
}

export async function getAdminPayments(filters: { status?: string } = {}): Promise<PendingPaymentItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("payments")
    .select(`${PAYMENT_COLUMNS}, order:orders ( order_no, total_usd, user:profiles ( full_name, email ) )`)
    .order("created_at", { ascending: filters.status === "pending" });
  if (filters.status) query = query.eq("status", filters.status as never);

  const { data, error } = await query;
  if (error) throw new Error(`getAdminPayments: ${error.message}`);

  const rows =
    (data as unknown as (RawPayment & {
      order: {
        order_no: string;
        total_usd: number;
        user: { full_name: string | null; email: string } | null;
      };
    })[]) ?? [];
  const urls = await signOrderFileUrls(supabase, proofPaths(rows));
  return rows.map((row) => ({
    ...mapPayment(row, urls),
    orderNo: row.order.order_no,
    orderTotalUsd: Number(row.order.total_usd),
    clientLabel: row.order.user?.full_name ?? row.order.user?.email ?? "Unknown",
  }));
}
