import Link from "next/link";

import { setVehicleFeatured, setVehicleSalePrice } from "@/actions/promotions";
import { FlashMessage } from "@/components/admin/flash-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/search/pagination";
import { requireRole } from "@/lib/auth/roles";
import { getAdminVehicles } from "@/lib/catalog/queries";
import { formatCurrency } from "@/lib/currency/format";

export default async function AdminPromotionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(["admin", "inventory_manager"]);
  const raw = await searchParams;
  const q = typeof raw.q === "string" && raw.q ? raw.q : undefined;
  const showAll = raw.show === "all";
  const page = typeof raw.page === "string" ? Number(raw.page) || 1 : 1;
  const error = typeof raw.error === "string" ? raw.error : undefined;

  const { vehicles, total, pageSize } = await getAdminVehicles({
    q,
    published: "true",
    promoted: showAll ? undefined : true,
    page,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Promotions</h1>
        <p className="text-sm text-muted-foreground">
          Featured vehicles and vehicles with a sale price appear in the home page &quot;Promotions&quot; section and
          under the &quot;Promotions only&quot; stock filter.
        </p>
      </div>
      <FlashMessage error={error} />

      <form method="get" action="/admin/promotions" className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="text-sm font-medium">Ref no.</label>
          <Input id="q" name="q" defaultValue={q} placeholder="JC-0001" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="show" className="text-sm font-medium">Show</label>
          <select
            id="show"
            name="show"
            defaultValue={showAll ? "all" : ""}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">On promotion</option>
            <option value="all">All published vehicles</option>
          </select>
        </div>
        <Button type="submit" size="sm">Filter</Button>
      </form>

      {vehicles.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {showAll ? "No published vehicles match." : "No vehicles on promotion. Choose \"All published vehicles\" to add some."}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Sale price</TableHead>
              <TableHead>Featured</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <Link href={`/admin/vehicles/${v.id}/edit`} className="hover:underline">
                    <span className="font-mono text-xs">{v.refNo}</span> {v.year} {v.makeName} {v.modelName}
                  </Link>
                  {v.status !== "available" && (
                    <Badge variant="outline" className="ml-2 capitalize">{v.status.replace("_", " ")}</Badge>
                  )}
                </TableCell>
                <TableCell className="tabular-nums">{formatCurrency(v.priceUsd)}</TableCell>
                <TableCell>
                  <form action={setVehicleSalePrice.bind(null, v.id)} className="flex items-center gap-2">
                    <Input
                      name="salePriceUsd"
                      type="number"
                      min={1}
                      step="1"
                      defaultValue={v.salePriceUsd ?? ""}
                      aria-label={`Sale price for ${v.refNo}`}
                      className="w-28"
                    />
                    <Button type="submit" size="xs" variant="outline">Save</Button>
                  </form>
                </TableCell>
                <TableCell>
                  <form action={setVehicleFeatured.bind(null, v.id, !v.featured)}>
                    <Button type="submit" size="xs" variant={v.featured ? "default" : "outline"} aria-pressed={v.featured}>
                      {v.featured ? "Featured" : "Feature"}
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Pagination page={page} pageSize={pageSize} total={total} searchParams={raw} basePath="/admin/promotions" />
    </div>
  );
}
