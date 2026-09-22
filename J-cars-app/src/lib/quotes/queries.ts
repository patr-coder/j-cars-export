import { createClient } from "@/lib/supabase/server";

export type QuoteListItem = {
  id: string;
  status: string;
  totalUsd: number;
  vehicleLabel: string;
  clientLabel: string;
  createdAt: string;
  expiresAt: string | null;
};

const LIST_SELECT = `
  id, status, total_usd, created_at, expires_at,
  vehicle:vehicles ( year, make:makes(name), model:models(name) ),
  user:profiles!quotes_user_id_fkey ( full_name, email ),
  inquiry:inquiries ( name, email )
`;

type RawRow = {
  id: string;
  status: string;
  total_usd: number;
  created_at: string;
  expires_at: string | null;
  vehicle: { year: number; make: { name: string }; model: { name: string } };
  user: { full_name: string | null; email: string } | null;
  inquiry: { name: string; email: string } | null;
};

function mapRow(row: RawRow): QuoteListItem {
  return {
    id: row.id,
    status: row.status,
    totalUsd: Number(row.total_usd),
    vehicleLabel: `${row.vehicle.year} ${row.vehicle.make.name} ${row.vehicle.model.name}`,
    clientLabel: row.user?.full_name ?? row.user?.email ?? row.inquiry?.name ?? "Unknown",
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

export async function getAdminQuotes(filters: { status?: string } = {}): Promise<QuoteListItem[]> {
  const supabase = await createClient();
  let query = supabase.from("quotes").select(LIST_SELECT).order("created_at", { ascending: false });
  if (filters.status) query = query.eq("status", filters.status as never);

  const { data, error } = await query;
  if (error) throw new Error(`getAdminQuotes: ${error.message}`);
  return ((data as unknown as RawRow[]) ?? []).map(mapRow);
}

export type QuoteDetail = QuoteListItem & {
  vehiclePrice: number;
  freight: number;
  insurance: number;
  inspection: number;
  certificate: number;
  otherFees: number;
  discount: number;
};

export async function getQuoteById(id: string): Promise<QuoteDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(
      `
      id, status, total_usd, created_at, expires_at,
      vehicle_price, freight, insurance, inspection, certificate, other_fees, discount,
      vehicle:vehicles ( year, make:makes(name), model:models(name) ),
      user:profiles!quotes_user_id_fkey ( full_name, email ),
      inquiry:inquiries ( name, email )
    `,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getQuoteById: ${error.message}`);
  if (!data) return null;

  const row = data as unknown as RawRow & {
    vehicle_price: number;
    freight: number;
    insurance: number;
    inspection: number;
    certificate: number;
    other_fees: number;
    discount: number;
  };

  return {
    ...mapRow(row),
    vehiclePrice: Number(row.vehicle_price),
    freight: Number(row.freight),
    insurance: Number(row.insurance),
    inspection: Number(row.inspection),
    certificate: Number(row.certificate),
    otherFees: Number(row.other_fees),
    discount: Number(row.discount),
  };
}

export async function getClientQuotes(userId: string): Promise<QuoteListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(LIST_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`getClientQuotes: ${error.message}`);
  return ((data as unknown as RawRow[]) ?? []).map(mapRow);
}
