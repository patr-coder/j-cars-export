import { ROLES } from "@/lib/customers/constants";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types";

export const CUSTOMERS_PAGE_SIZE = 30;

export type CustomerListItem = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  country: string | null;
  role: Role;
  orderCount: number;
  createdAt: string;
};

export type CustomerFilters = { q?: string; role?: string; page?: number };

type RawProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  country_code: string | null;
  consignee_country: string | null;
  role: Role;
  created_at: string;
  orders: { count: number }[];
};

// profiles are readable by admin and sales (migration 0011).
export async function getCustomers(filters: CustomerFilters): Promise<{
  customers: CustomerListItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const supabase = await createClient();
  const page = filters.page ?? 1;

  let query = supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, country_code, consignee_country, role, created_at, orders ( count )",
      { count: "exact" },
    );
  // Single-column ilike — see the note on getAdminVehicles about `.or()`.
  if (filters.q) query = query.ilike("email", `%${filters.q}%`);
  if (filters.role && (ROLES as readonly string[]).includes(filters.role)) {
    query = query.eq("role", filters.role as Role);
  }

  const from = (page - 1) * CUSTOMERS_PAGE_SIZE;
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + CUSTOMERS_PAGE_SIZE - 1);
  if (error) throw new Error(`getCustomers: ${error.message}`);

  const customers = ((data as unknown as RawProfileRow[]) ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    country: row.consignee_country || row.country_code,
    role: row.role,
    orderCount: row.orders[0]?.count ?? 0,
    createdAt: row.created_at,
  }));
  return { customers, total: count ?? 0, page, pageSize: CUSTOMERS_PAGE_SIZE };
}
