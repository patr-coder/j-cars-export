import Image from "next/image";
import Link from "next/link";

import { deleteVehicle, setVehiclePublished } from "@/actions/vehicles";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PublishedBadge, VehicleStatusBadge } from "@/components/status-badge";
import { Pagination } from "@/components/search/pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VEHICLE_STATUSES } from "@/lib/catalog/constants";
import { getAdminVehicles } from "@/lib/catalog/queries";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

export default async function AdminVehiclesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const q = typeof raw.q === "string" && raw.q ? raw.q : undefined;
  const status = typeof raw.status === "string" && raw.status ? raw.status : undefined;
  const published =
    raw.published === "true" || raw.published === "false" ? raw.published : undefined;
  const page = typeof raw.page === "string" ? Number(raw.page) || 1 : 1;

  const { vehicles, total, pageSize } = await getAdminVehicles({ q, status, published, page });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Vehicles</h1>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <Button asChild>
          <Link href="/admin/vehicles/new">New vehicle</Link>
        </Button>
      </div>

      <form method="get" action="/admin/vehicles" className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="text-sm font-medium">
            Search (ref)
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="JC-0001"
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <select id="status" name="status" defaultValue={status ?? ""} className={selectClassName}>
            <option value="">Any</option>
            {VEHICLE_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="published" className="text-sm font-medium">
            Visibility
          </label>
          <select id="published" name="published" defaultValue={published ?? ""} className={selectClassName}>
            <option value="">Any</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
        </div>
        <Button type="submit" size="sm">
          Filter
        </Button>
        <Button asChild variant="ghost" size="sm">
          <a href="/admin/vehicles">Clear</a>
        </Button>
      </form>

      {vehicles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No vehicles match these filters.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Ref</TableHead>
              <TableHead>Make / model</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                    {v.primaryImageUrl && (
                      <Image src={v.primaryImageUrl} alt="" fill unoptimized className="object-cover" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{v.refNo}</TableCell>
                <TableCell>
                  {v.makeName} {v.modelName}
                  {v.trim ? ` ${v.trim}` : ""}
                </TableCell>
                <TableCell>{v.year}</TableCell>
                <TableCell>${v.priceUsd.toLocaleString()}</TableCell>
                <TableCell>
                  <VehicleStatusBadge status={v.status} />
                </TableCell>
                <TableCell>
                  <PublishedBadge published={v.published} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button asChild size="xs" variant="outline">
                      <Link href={`/admin/vehicles/${v.id}/edit`}>Edit</Link>
                    </Button>
                    <form action={setVehiclePublished.bind(null, v.id, !v.published)}>
                      <Button type="submit" size="xs" variant="outline">
                        {v.published ? "Unpublish" : "Publish"}
                      </Button>
                    </form>
                    <form action={deleteVehicle.bind(null, v.id)}>
                      <ConfirmSubmitButton
                        type="submit"
                        size="xs"
                        variant="destructive"
                        confirmMessage={`Delete ${v.refNo}? This can't be undone from the admin UI.`}
                      >
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Pagination page={page} pageSize={pageSize} total={total} searchParams={raw} basePath="/admin/vehicles" />
    </div>
  );
}
