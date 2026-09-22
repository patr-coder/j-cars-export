import { buildVehicleSlug } from "@/lib/catalog/slug";
import { createClient } from "@/lib/supabase/server";

export type QuoteBreakdown = {
  vehiclePrice: number;
  freight: number;
  insurance: number;
  inspection: number;
  certificate: number;
  otherFees: number;
  discount: number;
};

export type OrderListItem = {
  id: string;
  orderNo: string;
  status: string;
  totalUsd: number;
  reservedUntil: string | null;
  cancelReason: string | null;
  vehicleLabel: string;
  vehicleSlug: string;
  clientLabel: string;
  quoteId: string | null;
  quoteBreakdown: QuoteBreakdown | null;
  createdAt: string;
};

// quote:quotes(...) is included at list level (not just detail) so
// /account/invoices can render the breakdown without an N+1 fetch per order.
const LIST_SELECT = `
  id, order_no, status, total_usd, reserved_until, cancel_reason, created_at, quote_id,
  vehicle:vehicles ( ref_no, year, make:makes(name, slug), model:models(name, slug) ),
  user:profiles ( full_name, email ),
  quote:quotes ( vehicle_price, freight, insurance, inspection, certificate, other_fees, discount )
`;

type RawQuote = {
  vehicle_price: number;
  freight: number;
  insurance: number;
  inspection: number;
  certificate: number;
  other_fees: number;
  discount: number;
};

type RawRow = {
  id: string;
  order_no: string;
  status: string;
  total_usd: number;
  reserved_until: string | null;
  cancel_reason: string | null;
  created_at: string;
  quote_id: string | null;
  vehicle: {
    ref_no: string;
    year: number;
    make: { name: string; slug: string };
    model: { name: string; slug: string };
  };
  user: { full_name: string | null; email: string } | null;
  quote: RawQuote | null;
};

function mapQuote(quote: RawQuote | null): QuoteBreakdown | null {
  if (!quote) return null;
  return {
    vehiclePrice: Number(quote.vehicle_price),
    freight: Number(quote.freight),
    insurance: Number(quote.insurance),
    inspection: Number(quote.inspection),
    certificate: Number(quote.certificate),
    otherFees: Number(quote.other_fees),
    discount: Number(quote.discount),
  };
}

function mapRow(row: RawRow): OrderListItem {
  return {
    id: row.id,
    orderNo: row.order_no,
    status: row.status,
    totalUsd: Number(row.total_usd),
    reservedUntil: row.reserved_until,
    cancelReason: row.cancel_reason,
    vehicleLabel: `${row.vehicle.year} ${row.vehicle.make.name} ${row.vehicle.model.name}`,
    vehicleSlug: buildVehicleSlug({
      makeSlug: row.vehicle.make.slug,
      modelSlug: row.vehicle.model.slug,
      refNo: row.vehicle.ref_no,
    }),
    clientLabel: row.user?.full_name ?? row.user?.email ?? "Unknown",
    quoteId: row.quote_id,
    quoteBreakdown: mapQuote(row.quote),
    createdAt: row.created_at,
  };
}

export async function getAdminOrders(filters: { status?: string } = {}): Promise<OrderListItem[]> {
  const supabase = await createClient();
  let query = supabase.from("orders").select(LIST_SELECT).order("created_at", { ascending: false });
  if (filters.status) query = query.eq("status", filters.status as never);

  const { data, error } = await query;
  if (error) throw new Error(`getAdminOrders: ${error.message}`);
  return ((data as unknown as RawRow[]) ?? []).map(mapRow);
}

export async function getClientOrders(userId: string): Promise<OrderListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(LIST_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`getClientOrders: ${error.message}`);
  return ((data as unknown as RawRow[]) ?? []).map(mapRow);
}

export type OrderDetail = OrderListItem & {
  vehicleId: string;
  userId: string;
};

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id, order_no, status, total_usd, reserved_until, cancel_reason, created_at, quote_id,
      vehicle_id, user_id,
      vehicle:vehicles ( ref_no, year, make:makes(name, slug), model:models(name, slug) ),
      user:profiles ( full_name, email ),
      quote:quotes ( vehicle_price, freight, insurance, inspection, certificate, other_fees, discount )
    `,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getOrderById: ${error.message}`);
  if (!data) return null;

  const row = data as unknown as RawRow & { vehicle_id: string; user_id: string };
  return { ...mapRow(row), vehicleId: row.vehicle_id, userId: row.user_id };
}
