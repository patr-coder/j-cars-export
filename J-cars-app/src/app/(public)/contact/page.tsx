import type { Metadata } from "next";

import { ContentBlocks } from "@/components/cms/content-blocks";
import { InquiryForm } from "@/components/quote/inquiry-form";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/session";
import { getVehicleBySlug } from "@/lib/catalog/queries";
import { whatsappHref } from "@/lib/contact/whatsapp";
import { getPublishedCmsPage, getSetting } from "@/lib/settings/queries";

export const metadata: Metadata = { title: "Contact", alternates: { canonical: "/contact" } };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string }>;
}) {
  const { vehicle: vehicleSlug } = await searchParams;
  const [profile, vehicle, page, contact] = await Promise.all([
    getCurrentProfile(),
    vehicleSlug ? getVehicleBySlug(vehicleSlug) : Promise.resolve(null),
    getPublishedCmsPage("contact"),
    getSetting("contact"),
  ]);
  const whatsapp = whatsappHref(
    contact.whatsapp,
    vehicle ? `Hello, I have a question about the ${vehicle.year} ${vehicle.makeName} ${vehicle.modelName} (ref ${vehicle.refNo}).` : undefined,
  );

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-[1fr_18rem]">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{page?.title ?? "Contact"}</h1>
        <div className="mt-2">
          {vehicle ? (
            <p className="text-muted-foreground">
              Ask us anything about the {vehicle.year} {vehicle.makeName} {vehicle.modelName}.
            </p>
          ) : page ? (
            <ContentBlocks body={page.body} />
          ) : (
            <p className="text-muted-foreground">Have a question? Send us a message and we&apos;ll get back to you.</p>
          )}
        </div>
        <div className="mt-6">
          <InquiryForm
            vehicleId={vehicle?.id}
            defaultName={profile?.full_name ?? undefined}
            defaultEmail={profile?.email ?? undefined}
          />
        </div>
      </div>

      {(whatsapp || contact.phone || contact.email || contact.address) && (
        <aside className="flex h-fit flex-col gap-3 rounded-xl border p-4 text-sm" aria-label="Other ways to reach us">
          <h2 className="font-semibold">Other ways to reach us</h2>
          {whatsapp && (
            <Button asChild variant="outline">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp
              </a>
            </Button>
          )}
          {contact.phone && (
            <p>
              Phone: <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="text-primary hover:underline">{contact.phone}</a>
            </p>
          )}
          {contact.email && (
            <p>
              Email: <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a>
            </p>
          )}
          {contact.address && <address className="whitespace-pre-line text-muted-foreground not-italic">{contact.address}</address>}
        </aside>
      )}
    </div>
  );
}
