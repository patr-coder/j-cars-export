import Link from "next/link";

import { setUserRole } from "@/actions/customers";
import { FlashMessage } from "@/components/admin/flash-message";
import { Pagination } from "@/components/search/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth/roles";
import { ROLE_LABELS, ROLES } from "@/lib/customers/constants";
import { getCustomers } from "@/lib/customers/queries";

const selectClassName =
  "h-8 min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const profile = await requireRole(["admin", "sales"]);
  const isAdmin = profile.role === "admin";
  const raw = await searchParams;
  const str = (k: string) => (typeof raw[k] === "string" && raw[k] ? (raw[k] as string) : undefined);
  const q = str("q");
  const role = str("role");
  const page = Number(str("page")) || 1;
  const { customers, total, pageSize } = await getCustomers({ q, role, page });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Customers & users</h1>
        <p className="text-sm text-muted-foreground">
          {total} accounts. {isAdmin && "Change a role to give someone staff access, or take it away."}
        </p>
      </div>
      <FlashMessage error={str("error")} />

      <form method="get" action="/admin/customers" className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="text-sm font-medium">Email</label>
          <Input id="q" name="q" defaultValue={q} placeholder="name@example.com" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="role" className="text-sm font-medium">Role</label>
          <select id="role" name="role" defaultValue={role ?? ""} className={selectClassName}>
            <option value="">Any</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        </div>
        <Button type="submit" size="sm">Filter</Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/customers">Clear</Link>
        </Button>
      </form>

      {customers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No accounts match these filters.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.fullName ?? "—"}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone ?? "—"}</TableCell>
                <TableCell>{c.country ?? "—"}</TableCell>
                <TableCell className="tabular-nums">{c.orderCount}</TableCell>
                <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {isAdmin && c.id !== profile.id ? (
                    <form action={setUserRole.bind(null, c.id)} className="flex items-center gap-2">
                      <select name="role" defaultValue={c.role} aria-label={`Role for ${c.email}`} className={selectClassName}>
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                      <Button type="submit" size="xs" variant="outline">Save</Button>
                    </form>
                  ) : (
                    <Badge variant={c.role === "client" ? "outline" : "default"}>{ROLE_LABELS[c.role]}</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Pagination page={page} pageSize={pageSize} total={total} searchParams={raw} basePath="/admin/customers" />
    </div>
  );
}
