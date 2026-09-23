import type { Metadata } from "next";

import { CmsPageView } from "@/components/cms/cms-page";
import { getPublishedCmsPage } from "@/lib/settings/queries";
import { getCountries, getPorts } from "@/lib/shipping/queries";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedCmsPage("shipping");
  return { title: page?.title ?? "Shipping", alternates: { canonical: "/shipping" } };
}

export default async function ShippingPage() {
  const [page, countries, ports] = await Promise.all([getPublishedCmsPage("shipping"), getCountries(), getPorts()]);
  const activePorts = ports.filter((p) => p.active);
  const served = countries
    .map((c) => ({ ...c, ports: activePorts.filter((p) => p.countryId === c.id) }))
    .filter((c) => c.ports.length > 0);

  return (
    <CmsPageView page={page} fallbackTitle="Shipping">
      {served.length > 0 && (
        <section className="mt-10" aria-labelledby="ports-heading">
          <h2 id="ports-heading" className="text-xl font-semibold">Destinations and ports</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {served.map((c) => (
              <li key={c.id} className="rounded-xl border p-4">
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-muted-foreground">
                  {c.ports.map((p) => `${p.name} (${p.code})`).join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </CmsPageView>
  );
}
