import { MapPinIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { VehicleStatusBadge } from "@/components/status-badge";
import { FavoriteButton } from "@/components/vehicle/favorite-button";
import { formatCurrency } from "@/lib/currency/format";
import { canOptimize } from "@/lib/images/optimize";
import type { VehicleListItem } from "@/lib/catalog/queries";

export function VehicleCard({
  vehicle,
  isFavorited = false,
  isSignedIn = false,
}: {
  vehicle: VehicleListItem;
  isFavorited?: boolean;
  isSignedIn?: boolean;
}) {
  const price = vehicle.salePriceUsd ?? vehicle.priceUsd;
  const onSale = vehicle.salePriceUsd !== null && vehicle.salePriceUsd < vehicle.priceUsd;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md">
      {/* Full-card click target, kept behind the favorite button (below) so
          the button gets its own click instead of nesting a <button> inside
          this <a>, which HTML doesn't allow. */}
      <Link href={`/cars/${vehicle.slug}`} className="absolute inset-0 z-0" aria-label={`${vehicle.year} ${vehicle.makeName} ${vehicle.modelName}`} />

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {vehicle.primaryImageUrl ? (
          <Image
            src={vehicle.primaryImageUrl}
            alt={`${vehicle.makeName} ${vehicle.modelName}`}
            fill
            unoptimized={!canOptimize(vehicle.primaryImageUrl)}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="pointer-events-none object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="pointer-events-none flex h-full items-center justify-center text-sm text-muted-foreground">
            No photo yet
          </div>
        )}
        {vehicle.status !== "available" && (
          <div className="pointer-events-none absolute top-2 left-2">
            <VehicleStatusBadge status={vehicle.status} />
          </div>
        )}
        <FavoriteButton
          vehicleId={vehicle.id}
          isFavorited={isFavorited}
          isSignedIn={isSignedIn}
          path={`/cars/${vehicle.slug}`}
          className="absolute top-2 right-2 z-10"
        />
      </div>

      <div className="pointer-events-none flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-medium">
          {vehicle.makeName} {vehicle.modelName}
          {vehicle.trim ? ` ${vehicle.trim}` : ""}
        </h3>
        <p className="text-sm text-muted-foreground">
          {vehicle.year} · {vehicle.mileageKm.toLocaleString()} km · {vehicle.fuelType} ·{" "}
          {vehicle.transmission}
        </p>
        {vehicle.locationLabel && (
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPinIcon className="size-3.5 shrink-0" />
            {vehicle.locationLabel}
          </p>
        )}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-semibold text-primary">{formatCurrency(price)}</span>
          {onSale && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(vehicle.priceUsd)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
