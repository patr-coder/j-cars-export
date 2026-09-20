import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency/format";
import type { VehicleListItem } from "@/lib/catalog/queries";

export function VehicleCard({ vehicle }: { vehicle: VehicleListItem }) {
  const price = vehicle.salePriceUsd ?? vehicle.priceUsd;
  const onSale = vehicle.salePriceUsd !== null && vehicle.salePriceUsd < vehicle.priceUsd;

  return (
    <Link
      href={`/cars/${vehicle.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {vehicle.primaryImageUrl ? (
          <Image
            src={vehicle.primaryImageUrl}
            alt={`${vehicle.makeName} ${vehicle.modelName}`}
            fill
            unoptimized
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No photo yet
          </div>
        )}
        {vehicle.status !== "available" && (
          <Badge variant="secondary" className="absolute top-2 left-2 capitalize">
            {vehicle.status.replace("_", " ")}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-medium">
          {vehicle.makeName} {vehicle.modelName}
          {vehicle.trim ? ` ${vehicle.trim}` : ""}
        </h3>
        <p className="text-sm text-muted-foreground">
          {vehicle.year} · {vehicle.mileageKm.toLocaleString()} km · {vehicle.fuelType}
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-semibold text-primary">{formatCurrency(price)}</span>
          {onSale && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(vehicle.priceUsd)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
