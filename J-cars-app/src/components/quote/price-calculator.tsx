"use client";

import { useMemo, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/currency/format";
import { calculateQuoteTotal } from "@/lib/pricing/calculator";
import type { ShippingRateOption } from "@/lib/shipping/queries";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

export function PriceCalculator({
  vehiclePriceUsd,
  rates,
}: {
  vehiclePriceUsd: number;
  rates: ShippingRateOption[];
}) {
  const countries = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rates) map.set(r.countryId, r.countryName);
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [rates]);

  const [countryId, setCountryId] = useState(countries[0]?.id ?? "");
  const portsForCountry = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rates) if (r.countryId === countryId) map.set(r.portId, r.portName);
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [rates, countryId]);

  const [portId, setPortId] = useState(portsForCountry[0]?.id ?? "");
  const ratesForPort = rates.filter((r) => r.portId === portId);
  const [method, setMethod] = useState(ratesForPort[0]?.method ?? "");
  const [insurance, setInsurance] = useState(false);
  const [inspection, setInspection] = useState(false);
  const [certificate, setCertificate] = useState(false);

  const selectedRate = ratesForPort.find((r) => r.method === method) ?? ratesForPort[0];

  if (rates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Shipping rates for this vehicle&apos;s location aren&apos;t set up yet — send us a request below
        and we&apos;ll get back to you with a full quote.
      </p>
    );
  }

  const breakdown = selectedRate
    ? calculateQuoteTotal(vehiclePriceUsd, selectedRate, { insurance, inspection, certificate })
    : null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="calc-country">Destination country</Label>
          <select
            id="calc-country"
            className={selectClassName}
            value={countryId}
            onChange={(e) => {
              setCountryId(e.target.value);
              const firstPort = rates.find((r) => r.countryId === e.target.value);
              setPortId(firstPort?.portId ?? "");
              setMethod(firstPort?.method ?? "");
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
          <Label htmlFor="calc-port">Destination port</Label>
          <select
            id="calc-port"
            className={selectClassName}
            value={portId}
            onChange={(e) => {
              setPortId(e.target.value);
              const firstRate = rates.find((r) => r.portId === e.target.value);
              setMethod(firstRate?.method ?? "");
            }}
          >
            {portsForCountry.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="calc-method">Shipping method</Label>
          <select
            id="calc-method"
            className={selectClassName + " capitalize"}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {ratesForPort.map((r) => (
              <option key={r.id} value={r.method} className="capitalize">
                {r.method.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={insurance} onCheckedChange={(v) => setInsurance(v === true)} />
          Insurance
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={inspection} onCheckedChange={(v) => setInspection(v === true)} />
          Inspection
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={certificate} onCheckedChange={(v) => setCertificate(v === true)} />
          Certificate
        </label>
      </div>

      {breakdown && (
        <dl className="grid grid-cols-2 gap-y-1 border-t pt-3 text-sm">
          <dt className="text-muted-foreground">Vehicle price</dt>
          <dd className="text-right">{formatCurrency(breakdown.vehiclePrice)}</dd>
          <dt className="text-muted-foreground">Freight</dt>
          <dd className="text-right">{formatCurrency(breakdown.freight)}</dd>
          {insurance && (
            <>
              <dt className="text-muted-foreground">Insurance</dt>
              <dd className="text-right">{formatCurrency(breakdown.insurance)}</dd>
            </>
          )}
          {inspection && (
            <>
              <dt className="text-muted-foreground">Inspection</dt>
              <dd className="text-right">{formatCurrency(breakdown.inspection)}</dd>
            </>
          )}
          {certificate && (
            <>
              <dt className="text-muted-foreground">Certificate</dt>
              <dd className="text-right">{formatCurrency(breakdown.certificate)}</dd>
            </>
          )}
          {breakdown.localExportFee > 0 && (
            <>
              <dt className="text-muted-foreground">Local / export fees</dt>
              <dd className="text-right">{formatCurrency(breakdown.localExportFee)}</dd>
            </>
          )}
          <dt className="border-t pt-2 font-semibold">Estimated total</dt>
          <dd className="border-t pt-2 text-right font-semibold text-primary">
            {formatCurrency(breakdown.total)}
          </dd>
        </dl>
      )}
      <p className="text-xs text-muted-foreground">
        Estimate only — submit a request below for a formal quote from our team.
      </p>
    </div>
  );
}
