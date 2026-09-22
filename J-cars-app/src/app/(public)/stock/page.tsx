import type { Metadata } from "next";

import { Pagination } from "@/components/search/pagination";
import { StockFilters } from "@/components/search/stock-filters";
import { VehicleCard } from "@/components/vehicle/vehicle-card";
import { parseVehicleSearchParams } from "@/lib/catalog/filters";
import { getLocations, getMakes, getModels, getVehicles } from "@/lib/catalog/queries";

export const metadata: Metadata = {
  title: "Stock",
  description: "Browse our full stock of quality used vehicles for export.",
};

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const filters = parseVehicleSearchParams(rawParams);

  const [{ vehicles, total, page, pageSize }, makes, models, locations] = await Promise.all([
    getVehicles(filters),
    getMakes(),
    getModels(),
    getLocations(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Stock</h1>

      <StockFilters makes={makes} models={models} locations={locations} defaults={filters} />

      <p className="my-4 text-sm text-muted-foreground">
        {total} vehicle{total === 1 ? "" : "s"} found
      </p>

      {vehicles.length === 0 ? (
        <div className="rounded-xl border p-12 text-center text-muted-foreground">
          No vehicles match these filters. Try widening your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Pagination page={page} pageSize={pageSize} total={total} searchParams={rawParams} basePath="/stock" />
      </div>
    </div>
  );
}
