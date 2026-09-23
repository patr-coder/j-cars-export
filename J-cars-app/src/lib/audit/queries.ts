import { createClient } from "@/lib/supabase/server";

export const AUDIT_PAGE_SIZE = 50;

export const AUDITED_TABLES = [
  "vehicles",
  "vehicle_images",
  "makes",
  "models",
  "locations",
  "countries",
  "ports",
  "shipping_rates",
  "inquiries",
  "quotes",
  "orders",
  "payments",
  "shipments",
  "order_documents",
  "profiles",
  "site_settings",
  "cms_pages",
] as const;

export const AUDIT_ACTIONS = ["insert", "update", "delete"] as const;

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  insert: "created",
  update: "updated",
  delete: "deleted",
};

export type AuditEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorEmail: string | null;
  actorName: string | null;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  createdAt: string;
};

export type AuditFilters = {
  entityType?: string;
  action?: string;
  entityId?: string;
  page?: number;
};

type RawAuditRow = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
  actor: { email: string; full_name: string | null } | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// audit_logs is admin-only under RLS (migration 0013).
export async function getAuditLog(
  filters: AuditFilters,
  pageSize = AUDIT_PAGE_SIZE,
): Promise<{ entries: AuditEntry[]; total: number; page: number; pageSize: number }> {
  const supabase = await createClient();
  const page = filters.page ?? 1;

  let query = supabase
    .from("audit_logs")
    .select(
      "id, action, entity_type, entity_id, old_data, new_data, created_at, actor:profiles ( email, full_name )",
      { count: "exact" },
    );
  if (filters.entityType && (AUDITED_TABLES as readonly string[]).includes(filters.entityType)) {
    query = query.eq("entity_type", filters.entityType);
  }
  if (filters.action && (AUDIT_ACTIONS as readonly string[]).includes(filters.action)) {
    query = query.eq("action", filters.action);
  }
  if (filters.entityId && UUID_RE.test(filters.entityId)) query = query.eq("entity_id", filters.entityId);

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);
  if (error) throw new Error(`getAuditLog: ${error.message}`);

  const entries = ((data as unknown as RawAuditRow[]) ?? []).map((row) => ({
    id: row.id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    actorEmail: row.actor?.email ?? null,
    actorName: row.actor?.full_name ?? null,
    oldData: row.old_data,
    newData: row.new_data,
    createdAt: row.created_at,
  }));
  return { entries, total: count ?? 0, page, pageSize };
}
