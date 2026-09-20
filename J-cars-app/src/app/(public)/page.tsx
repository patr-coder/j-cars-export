import Link from "next/link";

import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/vehicle/vehicle-card";
import { BODY_TYPES } from "@/lib/catalog/constants";
import { getMakes, getRecentVehicles, getVehicleStats } from "@/lib/catalog/queries";

export default async function HomePage() {
  const [stats, recent, makes] = await Promise.all([
    getVehicleStats(),
    getRecentVehicles(6),
    getMakes(),
  ]);

  return (
    <>
      <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-24">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Quality used vehicles,
          <br />
          exported worldwide.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          {stats.availableCount} vehicles available now. Browse our stock, get a
          landed-cost estimate, and track your vehicle from Japan to your port.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/stock">Browse stock</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/how-to-buy">How it works</Link>
          </Button>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recently added</h2>
            <Link href="/stock" className="text-sm text-primary hover:underline">
              View all stock
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-4 text-2xl font-semibold">Shop by make</h2>
        <div className="flex flex-wrap gap-2">
          {makes.map((make) => (
            <Link
              key={make.id}
              href={`/stock?make=${make.slug}`}
              className="rounded-full border px-4 py-1.5 text-sm hover:bg-muted"
            >
              {make.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-4 text-2xl font-semibold">Shop by type</h2>
        <div className="flex flex-wrap gap-2">
          {BODY_TYPES.map((type) => (
            <Link
              key={type}
              href={`/stock?bodyType=${type}`}
              className="rounded-full border px-4 py-1.5 text-sm capitalize hover:bg-muted"
            >
              {type}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
