import { notFound } from "next/navigation";

import { createQuoteFromInquiry } from "@/actions/quotes";
import { QuoteCreateForm } from "@/components/quote/quote-create-form";
import { getAdminVehicleById } from "@/lib/catalog/queries";
import { getInquiryById } from "@/lib/inquiries/queries";
import { getActiveShippingRatesForLocation } from "@/lib/shipping/queries";

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ inquiryId?: string }>;
}) {
  const { inquiryId } = await searchParams;
  if (!inquiryId) notFound();

  const inquiry = await getInquiryById(inquiryId);
  if (!inquiry || !inquiry.vehicleId) notFound();

  const vehicle = await getAdminVehicleById(inquiry.vehicleId);
  if (!vehicle) notFound();

  const rates = vehicle.locationId ? await getActiveShippingRatesForLocation(vehicle.locationId) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">New quote</h1>
        <p className="text-sm text-muted-foreground">
          For {inquiry.name} — {inquiry.vehicleLabel}
        </p>
      </div>
      <QuoteCreateForm
        vehiclePriceUsd={vehicle.priceUsd}
        rates={rates}
        action={createQuoteFromInquiry.bind(null, inquiryId)}
      />
    </div>
  );
}
