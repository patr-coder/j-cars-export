"use client";

import { useActionState, useMemo, useState } from "react";

import type { QuoteActionState } from "@/actions/quotes";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ShippingRateOption } from "@/lib/shipping/queries";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

const initialState: QuoteActionState = { error: null };

export function QuoteCreateForm({
  vehiclePriceUsd,
  rates,
  action,
}: {
  vehiclePriceUsd: number;
  rates: ShippingRateOption[];
  action: (prevState: QuoteActionState, formData: FormData) => Promise<QuoteActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const countries = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rates) map.set(r.countryId, r.countryName);
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [rates]);
  const [countryId, setCountryId] = useState(countries[0]?.id ?? "");
  const portsForCountry = rates.filter((r) => r.countryId === countryId);
  const uniquePorts = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of portsForCountry) map.set(r.portId, r.portName);
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [portsForCountry]);
  const [portId, setPortId] = useState(uniquePorts[0]?.id ?? "");
  const ratesForPort = rates.filter((r) => r.portId === portId);
  const [shippingRateId, setShippingRateId] = useState(ratesForPort[0]?.id ?? "");

  if (rates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No shipping rates are configured for this vehicle&apos;s location yet — add one under
        Admin → Shipping before creating a quote.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="country">Destination country</Label>
          <select
            id="country"
            className={selectClassName}
            value={countryId}
            onChange={(e) => {
              setCountryId(e.target.value);
              const first = rates.find((r) => r.countryId === e.target.value);
              setPortId(first?.portId ?? "");
              setShippingRateId(first?.id ?? "");
            }}
          >
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="port">Destination port</Label>
          <select
            id="port"
            className={selectClassName}
            value={portId}
            onChange={(e) => {
              setPortId(e.target.value);
              const first = rates.find((r) => r.portId === e.target.value);
              setShippingRateId(first?.id ?? "");
            }}
          >
            {uniquePorts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="shippingRateId">Method</Label>
          <select
            id="shippingRateId"
            name="shippingRateId"
            className={selectClassName + " capitalize"}
            value={shippingRateId}
            onChange={(e) => setShippingRateId(e.target.value)}
          >
            {ratesForPort.map((r) => (
              <option key={r.id} value={r.id} className="capitalize">
                {r.method.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="insurance" />
          Insurance
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="inspection" />
          Inspection
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="certificate" />
          Certificate
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="vehiclePrice">Vehicle price (USD)</Label>
          <Input id="vehiclePrice" name="vehiclePrice" type="number" step="0.01" defaultValue={vehiclePriceUsd} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="otherFees">Other fees (USD)</Label>
          <Input id="otherFees" name="otherFees" type="number" step="0.01" defaultValue={0} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="discount">Discount (USD)</Label>
          <Input id="discount" name="discount" type="number" step="0.01" defaultValue={0} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="expiresAt">Expires</Label>
          <Input id="expiresAt" name="expiresAt" type="date" />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Creating…" : "Create quote"}
      </Button>
    </form>
  );
}
