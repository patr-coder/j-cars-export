import {
  createCountry,
  createPort,
  createShippingRate,
  deleteCountry,
  deletePort,
  deleteShippingRate,
  setShippingRateActive,
} from "@/actions/shipping";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLocations } from "@/lib/catalog/queries";
import { SHIPPING_METHODS } from "@/lib/shipping/constants";
import { getAdminShippingRates, getCountries, getPorts } from "@/lib/shipping/queries";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

export default async function AdminShippingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [countries, ports, rates, locations] = await Promise.all([
    getCountries(),
    getPorts(),
    getAdminShippingRates(),
    getLocations(),
  ]);
  const countryName = new Map(countries.map((c) => [c.id, c.name]));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Shipping</h1>
      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Countries</h2>
        <ul className="flex flex-col divide-y rounded-xl border">
          {countries.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <span>
                {c.name} <span className="text-muted-foreground">({c.isoCode}, {c.currency})</span>
              </span>
              <form action={deleteCountry.bind(null, c.id)}>
                <ConfirmSubmitButton type="submit" size="xs" variant="destructive" confirmMessage={`Delete "${c.name}"?`}>
                  Delete
                </ConfirmSubmitButton>
              </form>
            </li>
          ))}
        </ul>
        <form action={createCountry} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="country-name">Name</Label>
            <Input id="country-name" name="name" placeholder="Kenya" required />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="country-iso">ISO code</Label>
            <Input id="country-iso" name="isoCode" placeholder="KE" maxLength={3} required />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="country-currency">Currency</Label>
            <Input id="country-currency" name="currency" placeholder="KES" maxLength={3} required />
          </div>
          <Button type="submit" size="sm">
            Add
          </Button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Ports</h2>
        <ul className="flex flex-col divide-y rounded-xl border">
          {ports.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <span>
                {p.name} ({p.code}) — {countryName.get(p.countryId) ?? "—"}
                {!p.active && <Badge variant="outline" className="ml-2">Inactive</Badge>}
              </span>
              <form action={deletePort.bind(null, p.id)}>
                <ConfirmSubmitButton type="submit" size="xs" variant="destructive" confirmMessage={`Delete port "${p.name}"?`}>
                  Delete
                </ConfirmSubmitButton>
              </form>
            </li>
          ))}
        </ul>
        <form action={createPort} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="port-country">Country</Label>
            <select id="port-country" name="countryId" required className={selectClassName}>
              <option value="" disabled>
                Select country
              </option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="port-name">Name</Label>
            <Input id="port-name" name="name" placeholder="Mombasa" required />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="port-code">Code</Label>
            <Input id="port-code" name="code" placeholder="MBA" required />
          </div>
          <Button type="submit" size="sm">
            Add
          </Button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Shipping rates</h2>
        <ul className="flex flex-col gap-2">
          {rates.map((r) => (
            <li key={r.id} className="flex flex-col gap-1 rounded-xl border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {r.originLabel} → {r.portName}, {r.countryName}{" "}
                  <span className="capitalize text-muted-foreground">({r.method.replace("_", " ")})</span>
                </span>
                <Badge variant={r.active ? "default" : "outline"}>{r.active ? "Active" : "Inactive"}</Badge>
              </div>
              <div className="text-muted-foreground">
                Base ${r.baseCostUsd.toLocaleString()}
                {r.insuranceRate !== null && ` · Insurance ${(r.insuranceRate * 100).toFixed(1)}%`}
                {r.inspectionFeeUsd !== null && ` · Inspection $${r.inspectionFeeUsd}`}
                {r.certificateFeeUsd !== null && ` · Certificate $${r.certificateFeeUsd}`}
                {r.localExportFeeUsd !== null && ` · Local/export $${r.localExportFeeUsd}`}
              </div>
              <div className="flex gap-2">
                <form action={setShippingRateActive.bind(null, r.id, !r.active)}>
                  <Button type="submit" size="xs" variant="outline">
                    {r.active ? "Deactivate" : "Activate"}
                  </Button>
                </form>
                <form action={deleteShippingRate.bind(null, r.id)}>
                  <ConfirmSubmitButton type="submit" size="xs" variant="destructive" confirmMessage="Delete this shipping rate?">
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>

        <form action={createShippingRate} className="grid max-w-3xl grid-cols-2 gap-3 rounded-xl border p-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="rate-origin">Origin location</Label>
            <select id="rate-origin" name="originLocationId" required className={selectClassName}>
              <option value="" disabled>
                Select origin
              </option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.city}, {l.country}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="rate-port">Destination port</Label>
            <select id="rate-port" name="destinationPortId" required className={selectClassName}>
              <option value="" disabled>
                Select port
              </option>
              {ports.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({countryName.get(p.countryId)})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="rate-method">Method</Label>
            <select id="rate-method" name="method" required className={selectClassName + " capitalize"}>
              {SHIPPING_METHODS.map((m) => (
                <option key={m} value={m} className="capitalize">
                  {m.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="rate-base">Base cost (USD)</Label>
            <Input id="rate-base" name="baseCostUsd" type="number" step="0.01" required />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="rate-m3">m³ rate (optional)</Label>
            <Input id="rate-m3" name="m3Rate" type="number" step="0.01" />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="rate-insurance">Insurance rate (e.g. 0.03 = 3%)</Label>
            <Input id="rate-insurance" name="insuranceRate" type="number" step="0.001" />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="rate-inspection">Inspection fee (USD)</Label>
            <Input id="rate-inspection" name="inspectionFeeUsd" type="number" step="0.01" />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="rate-certificate">Certificate fee (USD)</Label>
            <Input id="rate-certificate" name="certificateFeeUsd" type="number" step="0.01" />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="rate-local">Local / export fee (USD)</Label>
            <Input id="rate-local" name="localExportFeeUsd" type="number" step="0.01" />
          </div>
          <Button type="submit" size="sm" className="w-fit self-end">
            Add rate
          </Button>
        </form>
      </section>
    </div>
  );
}
