import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InquiryForm } from "@/components/quote/inquiry-form";
import { PriceCalculator } from "@/components/quote/price-calculator";
import { VehicleGallery } from "@/components/vehicle/vehicle-gallery";
import { getCurrentProfile } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/currency/format";
import { getVehicleBySlug } from "@/lib/catalog/queries";
import { getActiveShippingRatesForLocation } from "@/lib/shipping/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) return { title: "Vehicle not found" };

  const title = `${vehicle.year} ${vehicle.makeName} ${vehicle.modelName}${vehicle.trim ? ` ${vehicle.trim}` : ""}`;
  const description = `${title} — ${vehicle.mileageKm.toLocaleString()} km, ${vehicle.fuelType}, ${formatCurrency(vehicle.priceUsd)}. Ref ${vehicle.refNo}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: vehicle.primaryImageUrl ? [vehicle.primaryImageUrl] : undefined,
    },
  };
}

const SPEC_LABELS: Record<string, string> = {
  driveType: "Drive type",
  steeringSide: "Steering",
  bodyType: "Body type",
};

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const [profile, shippingRates] = await Promise.all([
    getCurrentProfile(),
    vehicle.locationId ? getActiveShippingRatesForLocation(vehicle.locationId) : Promise.resolve([]),
  ]);

  const price = vehicle.salePriceUsd ?? vehicle.priceUsd;
  const onSale = vehicle.salePriceUsd !== null && vehicle.salePriceUsd < vehicle.priceUsd;
  const title = `${vehicle.year} ${vehicle.makeName} ${vehicle.modelName}${vehicle.trim ? ` ${vehicle.trim}` : ""}`;

  const specs: { label: string; value: string | number | null }[] = [
    { label: "Reference", value: vehicle.refNo },
    { label: "Year / Month", value: vehicle.month ? `${vehicle.year} / ${vehicle.month}` : vehicle.year },
    { label: "Mileage", value: `${vehicle.mileageKm.toLocaleString()} km` },
    { label: "Engine", value: vehicle.engineCc ? `${vehicle.engineCc} cc` : null },
    { label: "Fuel", value: vehicle.fuelType },
    { label: "Transmission", value: vehicle.transmission },
    { label: SPEC_LABELS.driveType, value: vehicle.driveType.toUpperCase() },
    { label: SPEC_LABELS.steeringSide, value: vehicle.steeringSide },
    { label: SPEC_LABELS.bodyType, value: vehicle.bodyType },
    { label: "Color", value: vehicle.color },
    { label: "Seats", value: vehicle.seats },
    { label: "Doors", value: vehicle.doors },
    {
      label: "Dimensions (mm)",
      value:
        vehicle.widthMm && vehicle.heightMm && vehicle.lengthMm
          ? `${vehicle.lengthMm} × ${vehicle.widthMm} × ${vehicle.heightMm}`
          : null,
    },
    { label: "Weight", value: vehicle.weightKg ? `${vehicle.weightKg} kg` : null },
    { label: "Location", value: vehicle.locationLabel },
  ].filter((spec) => spec.value !== null && spec.value !== undefined);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: title,
    brand: vehicle.makeName,
    model: vehicle.modelName,
    vehicleModelDate: String(vehicle.year),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: vehicle.mileageKm, unitCode: "KMT" },
    fuelType: vehicle.fuelType,
    vehicleTransmission: vehicle.transmission,
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: "USD",
      availability:
        vehicle.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <VehicleGallery images={vehicle.images} alt={title} />

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Ref {vehicle.refNo}</p>
            <h1 className="text-3xl font-semibold">{title}</h1>
          </div>

          {vehicle.status !== "available" && (
            <Badge variant="secondary" className="w-fit capitalize">
              {vehicle.status.replace("_", " ")}
            </Badge>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatCurrency(price)}</span>
            {onSale && (
              <span className="text-lg text-muted-foreground line-through">
                {formatCurrency(vehicle.priceUsd)}
              </span>
            )}
            <span className="text-sm text-muted-foreground">FOB</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="#quote">Get Quote</a>
            </Button>
            <Button variant="outline" disabled title="Available from Phase 5">
              Reserve Vehicle
            </Button>
            <Button variant="outline" disabled title="Available from Phase 6">
              WhatsApp
            </Button>
            <Button asChild variant="ghost">
              <Link href={`/contact?vehicle=${vehicle.slug}`}>Ask a Question</Link>
            </Button>
          </div>

          {vehicle.description && (
            <p className="whitespace-pre-line text-muted-foreground">{vehicle.description}</p>
          )}

          <dl className="mt-2 grid grid-cols-2 gap-y-2 border-t pt-4 text-sm">
            {specs.map((spec) => (
              <Fragment key={spec.label}>
                <dt className="text-muted-foreground">{spec.label}</dt>
                <dd className="capitalize">{spec.value}</dd>
              </Fragment>
            ))}
          </dl>
        </div>
      </div>

      <section id="quote" className="mx-auto mt-12 max-w-2xl scroll-mt-20 border-t pt-10">
        <h2 className="mb-4 text-xl font-semibold">Request a quote</h2>
        <div className="flex flex-col gap-6">
          <PriceCalculator vehiclePriceUsd={price} rates={shippingRates} />
          <InquiryForm
            vehicleId={vehicle.id}
            defaultName={profile?.full_name ?? undefined}
            defaultEmail={profile?.email ?? undefined}
          />
        </div>
      </section>
    </div>
  );
}
