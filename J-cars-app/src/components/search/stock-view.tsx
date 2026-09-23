import { Pagination } from "@/components/search/pagination";
import { SaveSearchButton } from "@/components/search/save-search-button";
import { StockFilters } from "@/components/search/stock-filters";
import { VehicleCard } from "@/components/vehicle/vehicle-card";
import { getCurrentUser } from "@/lib/auth/session";
import type { VehicleSearchParams } from "@/lib/catalog/filters";
import { getLocations, getMakes, getModels, getVehicles } from "@/lib/catalog/queries";
import { getFavoriteVehicleIds } from "@/lib/favorites/queries";

// Shared by /stock and the indexable /stock/[make](/[model]) pages. The
// filter form always submits to /stock, so a brand page is just a
// pre-filtered, crawlable entry point into the same search.
export async function StockView({
  title,
  intro,
  filters,
  rawParams,
  basePath,
}: {
  title: string;
  intro?: string;
  filters: VehicleSearchParams;
  rawParams: Record<string, string | string[] | undefined>;
  basePath: string;
}) {
  const user = await getCurrentUser();
  const [{ vehicles, total, page, pageSize }, makes, models, locations, favoriteIds] = await Promise.all([
    getVehicles(filters),
    getMakes(),
    getModels(),
    getLocations(),
    user ? getFavoriteVehicleIds(user.id) : Promise.resolve(new Set<string>()),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {intro && <p className="mt-1 text-muted-foreground">{intro}</p>}

      <div className="mt-6">
        <StockFilters makes={makes} models={models} locations={locations} defaults={filters} />
      </div>

      <div className="my-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" role="status">
          {total} vehicle{total === 1 ? "" : "s"} found
        </p>
        <SaveSearchButton filters={filters} isSignedIn={!!user} />
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-xl border p-12 text-center text-muted-foreground">
          No vehicles match these filters. Try widening your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} isFavorited={favoriteIds.has(vehicle.id)} isSignedIn={!!user} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Pagination page={page} pageSize={pageSize} total={total} searchParams={rawParams} basePath={basePath} />
      </div>
    </div>
  );
}
