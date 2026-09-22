import { buildVehicleSlug } from "@/lib/catalog/slug";
import { createClient } from "@/lib/supabase/server";

export type InquiryListItem = {
  id: string;
  name: string;
  email: string;
  status: string;
  vehicleLabel: string | null;
  assigneeName: string | null;
  createdAt: string;
};

const LIST_SELECT = `
  id, name, email, status, created_at,
  vehicle:vehicles ( year, make:makes(name), model:models(name) ),
  assignee:profiles!inquiries_assigned_to_fkey ( full_name, email )
`;

type RawListRow = {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
  vehicle: { year: number; make: { name: string }; model: { name: string } } | null;
  assignee: { full_name: string | null; email: string } | null;
};

function vehicleLabel(v: RawListRow["vehicle"]): string | null {
  return v ? `${v.year} ${v.make.name} ${v.model.name}` : null;
}

export async function getAdminInquiries(filters: { status?: string } = {}): Promise<InquiryListItem[]> {
  const supabase = await createClient();
  let query = supabase.from("inquiries").select(LIST_SELECT).order("created_at", { ascending: false });
  if (filters.status) query = query.eq("status", filters.status as never);

  const { data, error } = await query;
  if (error) throw new Error(`getAdminInquiries: ${error.message}`);

  return ((data as unknown as RawListRow[]) ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.status,
    vehicleLabel: vehicleLabel(row.vehicle),
    assigneeName: row.assignee?.full_name ?? row.assignee?.email ?? null,
    createdAt: row.created_at,
  }));
}

export type InquiryDetail = InquiryListItem & {
  phone: string | null;
  message: string | null;
  vehicleId: string | null;
  vehicleSlug: string | null;
  vehicleImageUrl: string | null;
  assignedTo: string | null;
  quotes: { id: string; status: string; totalUsd: number }[];
};

export async function getInquiryById(id: string): Promise<InquiryDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select(
      `
      id, name, email, phone, message, status, created_at, vehicle_id, assigned_to,
      vehicle:vehicles (
        ref_no, year,
        make:makes(name, slug), model:models(name, slug),
        vehicle_images ( public_url, is_primary, sort_order )
      ),
      assignee:profiles!inquiries_assigned_to_fkey ( full_name, email ),
      quotes ( id, status, total_usd )
    `,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getInquiryById: ${error.message}`);
  if (!data) return null;

  const row = data as unknown as {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    message: string | null;
    status: string;
    created_at: string;
    vehicle_id: string | null;
    assigned_to: string | null;
    vehicle: {
      ref_no: string;
      year: number;
      make: { name: string; slug: string };
      model: { name: string; slug: string };
      vehicle_images: { public_url: string; is_primary: boolean; sort_order: number }[];
    } | null;
    assignee: { full_name: string | null; email: string } | null;
    quotes: { id: string; status: string; total_usd: number }[];
  };

  const primaryImage = row.vehicle
    ? [...row.vehicle.vehicle_images].sort(
        (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
      )[0]
    : undefined;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    status: row.status,
    vehicleLabel: row.vehicle ? `${row.vehicle.year} ${row.vehicle.make.name} ${row.vehicle.model.name}` : null,
    vehicleId: row.vehicle_id,
    vehicleSlug: row.vehicle
      ? buildVehicleSlug({
          makeSlug: row.vehicle.make.slug,
          modelSlug: row.vehicle.model.slug,
          refNo: row.vehicle.ref_no,
        })
      : null,
    vehicleImageUrl: primaryImage?.public_url ?? null,
    assigneeName: row.assignee?.full_name ?? row.assignee?.email ?? null,
    assignedTo: row.assigned_to,
    createdAt: row.created_at,
    quotes: row.quotes.map((q) => ({ id: q.id, status: q.status, totalUsd: Number(q.total_usd) })),
  };
}

export async function getClientInquiries(userId: string): Promise<InquiryListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select(LIST_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`getClientInquiries: ${error.message}`);
  return ((data as unknown as RawListRow[]) ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.status,
    vehicleLabel: vehicleLabel(row.vehicle),
    assigneeName: row.assignee?.full_name ?? row.assignee?.email ?? null,
    createdAt: row.created_at,
  }));
}

export async function getAssignableStaff(): Promise<{ id: string; label: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("role", ["admin", "sales"])
    .order("full_name");
  if (error) throw new Error(`getAssignableStaff: ${error.message}`);
  return (data ?? []).map((p) => ({ id: p.id, label: p.full_name ?? p.email }));
}
