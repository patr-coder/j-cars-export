import type { Metadata } from "next";

import { InquiryForm } from "@/components/quote/inquiry-form";
import { getCurrentProfile } from "@/lib/auth/session";
import { getVehicleBySlug } from "@/lib/catalog/queries";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string }>;
}) {
  const { vehicle: vehicleSlug } = await searchParams;
  const [profile, vehicle] = await Promise.all([
    getCurrentProfile(),
    vehicleSlug ? getVehicleBySlug(vehicleSlug) : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Contact</h1>
      <p className="mt-2 text-muted-foreground">
        {vehicle
          ? `Ask us anything about the ${vehicle.year} ${vehicle.makeName} ${vehicle.modelName}.`
          : "Have a question? Send us a message and we'll get back to you."}
      </p>
      <div className="mt-6">
        <InquiryForm
          vehicleId={vehicle?.id}
          defaultName={profile?.full_name ?? undefined}
          defaultEmail={profile?.email ?? undefined}
        />
      </div>
    </div>
  );
}
