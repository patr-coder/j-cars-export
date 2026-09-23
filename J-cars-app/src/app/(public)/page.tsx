import Link from "next/link";

import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/vehicle/vehicle-card";
import { getCurrentUser } from "@/lib/auth/session";
import { BODY_TYPES } from "@/lib/catalog/constants";
import { getMakes, getPromotedVehicles, getRecentVehicles, getVehicleStats } from "@/lib/catalog/queries";
import { whatsappHref } from "@/lib/contact/whatsapp";
import { getFavoriteVehicleIds } from "@/lib/favorites/queries";
import { serializeJsonLd } from "@/lib/seo/json-ld";
import { getSetting } from "@/lib/settings/queries";
import { getCountries, getPorts } from "@/lib/shipping/queries";
import type { VehicleListItem } from "@/lib/catalog/queries";

const HOW_TO_BUY_STEPS = [
  { title: "Find your vehicle", text: "Browse the stock and filter by make, price, year or body type." },
  { title: "Get a quote", text: "Pick your destination port for a landed-cost estimate, then request a quote." },
  { title: "Reserve & pay", text: "Reserve from your account and pay by bank transfer." },
  { title: "Track delivery", text: "Follow the vessel, ETA and documents in your account." },
];

const PRICE_RANGES = [
  { label: "Under $5,000", query: "maxPrice=5000" },
  { label: "$5,000 – $10,000", query: "minPrice=5000&maxPrice=10000" },
  { label: "$10,000 – $20,000", query: "minPrice=10000&maxPrice=20000" },
  { label: "Over $20,000", query: "minPrice=20000" },
];

function VehicleGrid({
  vehicles,
  favoriteIds,
  isSignedIn,
}: {
  vehicles: VehicleListItem[];
  favoriteIds: Set<string>;
  isSignedIn: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} isFavorited={favoriteIds.has(vehicle.id)} isSignedIn={isSignedIn} />
      ))}
    </div>
  );
}

export default async function HomePage() {
  const user = await getCurrentUser();
  const [stats, promoted, recent, makes, favoriteIds, hero, faq, testimonials, contact, countries, ports] =
    await Promise.all([
      getVehicleStats(),
      getPromotedVehicles(6),
      getRecentVehicles(6),
      getMakes(),
      user ? getFavoriteVehicleIds(user.id) : Promise.resolve(new Set<string>()),
      getSetting("hero"),
      getSetting("faq"),
      getSetting("testimonials"),
      getSetting("contact"),
      getCountries(),
      getPorts(),
    ]);
  const whatsapp = whatsappHref(contact.whatsapp, "Hello J-cars Exports, I have a question about a vehicle.");
  const portsByCountry = new Map<string, string[]>();
  for (const port of ports.filter((p) => p.active)) {
    portsByCountry.set(port.countryId, [...(portsByCountry.get(port.countryId) ?? []), port.name]);
  }
  const servedCountries = countries.filter((c) => portsByCountry.has(c.id));
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: "J-cars Exports",
    url: siteUrl,
    logo: `${siteUrl}/brand/jcars-logo.png`,
    ...(contact.email && { email: contact.email }),
    ...(contact.phone && { telephone: contact.phone }),
    sameAs: [contact.facebook, contact.instagram, contact.youtube, contact.tiktok, contact.x].filter(Boolean),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }} />
      <section className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-20 sm:py-24">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">{hero.title}</h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          <span className="font-semibold text-foreground">{stats.availableCount} vehicles available now.</span>{" "}
          {hero.subtitle}
        </p>
        <form method="get" action="/stock" role="search" className="flex w-full max-w-xl gap-2">
          <label htmlFor="hero-search" className="sr-only">
            Search the stock
          </label>
          <input
            id="hero-search"
            name="q"
            type="search"
            placeholder="Search the stock…"
            className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-transparent px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button type="submit" size="lg">
            Search
          </Button>
        </form>
        <div className="flex flex-wrap gap-3">
          {hero.cta_label && hero.cta_url && (
            <Button asChild size="lg">
              <Link href={hero.cta_url}>{hero.cta_label}</Link>
            </Button>
          )}
          <Button asChild variant="outline" size="lg">
            <Link href="/how-to-buy">How it works</Link>
          </Button>
        </div>
      </section>

      {promoted.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12" aria-labelledby="promotions-heading">
          <div className="mb-6 flex items-center justify-between">
            <h2 id="promotions-heading" className="text-2xl font-semibold">Promotions & featured</h2>
            <Link href="/stock?promotion=1" className="text-sm text-primary hover:underline">
              All promotions
            </Link>
          </div>
          <VehicleGrid vehicles={promoted} favoriteIds={favoriteIds} isSignedIn={!!user} />
        </section>
      )}

      {recent.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12" aria-labelledby="recent-heading">
          <div className="mb-6 flex items-center justify-between">
            <h2 id="recent-heading" className="text-2xl font-semibold">Recently added</h2>
            <Link href="/stock" className="text-sm text-primary hover:underline">
              View all stock
            </Link>
          </div>
          <VehicleGrid vehicles={recent} favoriteIds={favoriteIds} isSignedIn={!!user} />
        </section>
      )}

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Shop by make</h2>
          <div className="flex flex-wrap gap-2">
            {makes.map((make) => (
              <Link key={make.id} href={`/stock/${make.slug}`} className="rounded-full border px-4 py-1.5 text-sm hover:bg-muted">
                {make.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold">Shop by type</h2>
          <div className="flex flex-wrap gap-2">
            {BODY_TYPES.map((type) => (
              <Link key={type} href={`/stock?bodyType=${type}`} className="rounded-full border px-4 py-1.5 text-sm capitalize hover:bg-muted">
                {type}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold">Shop by price</h2>
          <div className="flex flex-wrap gap-2">
            {PRICE_RANGES.map((range) => (
              <Link key={range.label} href={`/stock?${range.query}`} className="rounded-full border px-4 py-1.5 text-sm hover:bg-muted">
                {range.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-12" aria-labelledby="how-heading">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 id="how-heading" className="text-2xl font-semibold">How to buy</h2>
            <Link href="/how-to-buy" className="text-sm text-primary hover:underline">
              Full guide
            </Link>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_TO_BUY_STEPS.map((step, i) => (
              <li key={step.title} className="rounded-xl border bg-background p-4">
                <span className="text-sm font-semibold text-primary">Step {i + 1}</span>
                <h3 className="mt-1 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {servedCountries.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12" aria-labelledby="countries-heading">
          <h2 id="countries-heading" className="mb-4 text-2xl font-semibold">Countries we ship to</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {servedCountries.map((c) => (
              <li key={c.id} className="rounded-xl border p-4">
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-muted-foreground">{portsByCountry.get(c.id)?.join(", ")}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {testimonials.items.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12" aria-labelledby="testimonials-heading">
          <h2 id="testimonials-heading" className="mb-4 text-2xl font-semibold">What our customers say</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {testimonials.items.map((t) => (
              <li key={t.id}>
                <figure className="h-full rounded-xl border p-4">
                  <blockquote className="text-sm">“{t.quote}”</blockquote>
                  <figcaption className="mt-3 text-sm font-medium">
                    {t.name}
                    {t.country && <span className="font-normal text-muted-foreground">, {t.country}</span>}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

      {faq.items.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 py-12" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="mb-4 text-2xl font-semibold">Frequently asked questions</h2>
          <div className="flex flex-col divide-y rounded-xl border">
            {faq.items.map((item) => (
              <details key={item.id} className="group px-4 py-3">
                <summary className="cursor-pointer font-medium">{item.question}</summary>
                <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pt-4 pb-16">
        <div className="flex flex-col items-start gap-4 rounded-2xl bg-primary px-6 py-8 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Questions about a vehicle?</h2>
            <p className="text-sm opacity-90">Message us and our sales team will get back to you.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {whatsapp && (
              <Button asChild variant="secondary" size="lg">
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </a>
              </Button>
            )}
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/contact">Send a message</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
