import Link from "next/link";

import { Pagination } from "@/components/search/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changedFields } from "@/lib/audit/diff";
import { AUDIT_ACTION_LABELS, AUDIT_ACTIONS, AUDITED_TABLES, getAuditLog } from "@/lib/audit/queries";
import { requireRole } from "@/lib/auth/roles";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

function formatValue(value: unknown): string {
  if (value === undefined || value === null) return "—";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 120 ? `${text.slice(0, 117)}…` : text;
}

function entityLabel(entry: { entityType: string; entityId: string | null; newData: Record<string, unknown> | null; oldData: Record<string, unknown> | null }) {
  const row = entry.newData ?? entry.oldData ?? {};
  const hint = row.ref_no ?? row.order_no ?? row.key ?? row.slug ?? row.email ?? row.name;
  return typeof hint === "string" ? hint : (entry.entityId?.slice(0, 8) ?? "");
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(["admin"]);
  const raw = await searchParams;
  const str = (k: string) => (typeof raw[k] === "string" && raw[k] ? (raw[k] as string) : undefined);
  const filters = {
    entityType: str("entity"),
    action: str("action"),
    entityId: str("id"),
    page: Number(str("page")) || 1,
  };
  const { entries, total, page, pageSize } = await getAuditLog(filters);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit log</h1>
        <p className="text-sm text-muted-foreground">
          Every change to vehicles, orders, payments, content and users, recorded by the database. {total} entries.
        </p>
      </div>

      <form method="get" action="/admin/audit" className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="entity" className="text-sm font-medium">Table</label>
          <select id="entity" name="entity" defaultValue={filters.entityType ?? ""} className={selectClassName}>
            <option value="">Any</option>
            {AUDITED_TABLES.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="action" className="text-sm font-medium">Action</label>
          <select id="action" name="action" defaultValue={filters.action ?? ""} className={selectClassName}>
            <option value="">Any</option>
            {AUDIT_ACTIONS.map((a) => (
              <option key={a} value={a}>{AUDIT_ACTION_LABELS[a]}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="id" className="text-sm font-medium">Record ID</label>
          <Input id="id" name="id" defaultValue={filters.entityId} placeholder="uuid" className="w-72" />
        </div>
        <Button type="submit" size="sm">Filter</Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/audit">Clear</Link>
        </Button>
      </form>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No entries match these filters.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((e) => {
            const changes = changedFields(e.oldData, e.newData);
            return (
              <li key={e.id} className="rounded-xl border">
                <details>
                  <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
                    <span>
                      <span className="font-medium">{e.actorName ?? e.actorEmail ?? "System / guest"}</span>{" "}
                      <span className="text-muted-foreground">{AUDIT_ACTION_LABELS[e.action] ?? e.action}</span>{" "}
                      {e.entityType.replace(/_/g, " ")}{" "}
                      <span className="font-mono text-xs">{entityLabel(e)}</span>
                      {e.action === "update" && (
                        <span className="text-muted-foreground"> · {changes.map((c) => c.field).join(", ")}</span>
                      )}
                    </span>
                    <time dateTime={e.createdAt} className="text-xs text-muted-foreground">
                      {new Date(e.createdAt).toLocaleString()}
                    </time>
                  </summary>
                  <div className="overflow-x-auto border-t px-4 py-2">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th scope="col" className="py-1 pr-4 font-medium">Field</th>
                          <th scope="col" className="py-1 pr-4 font-medium">Before</th>
                          <th scope="col" className="py-1 font-medium">After</th>
                        </tr>
                      </thead>
                      <tbody>
                        {changes.map((c) => (
                          <tr key={c.field} className="border-t align-top">
                            <td className="py-1 pr-4 font-mono">{c.field}</td>
                            <td className="py-1 pr-4 break-all">{formatValue(c.before)}</td>
                            <td className="py-1 break-all">{formatValue(c.after)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {e.entityId && (
                      <Link href={`/admin/audit?id=${e.entityId}`} className="mt-2 inline-block text-xs text-primary hover:underline">
                        History of this record
                      </Link>
                    )}
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination page={page} pageSize={pageSize} total={total} searchParams={raw} basePath="/admin/audit" />
    </div>
  );
}
