import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminInquiries } from "@/lib/inquiries/queries";
import { INQUIRY_STATUSES } from "@/lib/inquiries/constants";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const inquiries = await getAdminInquiries({ status });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Inquiries</h1>
        <p className="text-sm text-muted-foreground">{inquiries.length} total</p>
      </div>

      <form method="get" action="/admin/inquiries" className="flex items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <select id="status" name="status" defaultValue={status ?? ""} className={selectClassName}>
            <option value="">Any</option>
            {INQUIRY_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="sm">
          Filter
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/inquiries">Clear</Link>
        </Button>
      </form>

      {inquiries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No inquiries match these filters.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned to</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((i) => (
              <TableRow key={i.id}>
                <TableCell>
                  <div>{i.name}</div>
                  <div className="text-xs text-muted-foreground">{i.email}</div>
                </TableCell>
                <TableCell>{i.vehicleLabel ?? "General inquiry"}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {i.status}
                  </Badge>
                </TableCell>
                <TableCell>{i.assigneeName ?? "—"}</TableCell>
                <TableCell>{new Date(i.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button asChild size="xs" variant="outline">
                    <Link href={`/admin/inquiries/${i.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
