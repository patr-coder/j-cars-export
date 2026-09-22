import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QUOTE_STATUSES } from "@/lib/quotes/constants";
import { getAdminQuotes } from "@/lib/quotes/queries";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const quotes = await getAdminQuotes({ status });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Quotes</h1>
        <p className="text-sm text-muted-foreground">{quotes.length} total</p>
      </div>

      <form method="get" action="/admin/quotes" className="flex items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <select id="status" name="status" defaultValue={status ?? ""} className={selectClassName}>
            <option value="">Any</option>
            {QUOTE_STATUSES.map((s) => (
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
          <Link href="/admin/quotes">Clear</Link>
        </Button>
      </form>

      {quotes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No quotes match these filters.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((q) => (
              <TableRow key={q.id}>
                <TableCell>{q.clientLabel}</TableCell>
                <TableCell>{q.vehicleLabel}</TableCell>
                <TableCell>${q.totalUsd.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {q.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(q.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button asChild size="xs" variant="outline">
                    <Link href={`/admin/quotes/${q.id}/edit`}>Edit</Link>
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
