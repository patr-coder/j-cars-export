"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BODY_TYPES, FUEL_TYPES, STEERING_SIDES, TRANSMISSIONS } from "@/lib/catalog/constants";
import { SORT_OPTIONS, type VehicleSearchParams } from "@/lib/catalog/filters";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

export function StockFilters({
  makes,
  models,
  locations,
  defaults,
}: {
  makes: { id: string; name: string; slug: string }[];
  models: { id: string; makeId: string; name: string; slug: string }[];
  locations: { id: string; city: string; country: string }[];
  defaults: VehicleSearchParams;
}) {
  const [selectedMake, setSelectedMake] = useState(defaults.make ?? "");
  const makeIdBySlug = new Map(makes.map((m) => [m.slug, m.id]));
  const visibleModels = selectedMake
    ? models.filter((m) => m.makeId === makeIdBySlug.get(selectedMake))
    : models;

  return (
    <form method="get" action="/stock" className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <div className="col-span-2 flex flex-col gap-1 sm:col-span-3 lg:col-span-4">
          <Label htmlFor="q">Keyword</Label>
          <Input id="q" name="q" defaultValue={defaults.q} placeholder="Search description…" />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="make">Make</Label>
          <select
            id="make"
            name="make"
            className={selectClassName}
            defaultValue={defaults.make ?? ""}
            onChange={(e) => setSelectedMake(e.target.value)}
          >
            <option value="">Any</option>
            {makes.map((m) => (
              <option key={m.id} value={m.slug}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="model">Model</Label>
          <select id="model" name="model" className={selectClassName} defaultValue={defaults.model ?? ""}>
            <option value="">Any</option>
            {visibleModels.map((m) => (
              <option key={m.id} value={m.slug}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="bodyType">Body type</Label>
          <select id="bodyType" name="bodyType" className={selectClassName} defaultValue={defaults.bodyType ?? ""}>
            <option value="">Any</option>
            {BODY_TYPES.map((b) => (
              <option key={b} value={b} className="capitalize">
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="location">Location</Label>
          <select id="location" name="location" className={selectClassName} defaultValue={defaults.location ?? ""}>
            <option value="">Any</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.city}, {l.country}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="minYear">Year min</Label>
          <Input id="minYear" name="minYear" type="number" defaultValue={defaults.minYear} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="maxYear">Year max</Label>
          <Input id="maxYear" name="maxYear" type="number" defaultValue={defaults.maxYear} />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="minPrice">Price min (USD)</Label>
          <Input id="minPrice" name="minPrice" type="number" defaultValue={defaults.minPrice} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="maxPrice">Price max (USD)</Label>
          <Input id="maxPrice" name="maxPrice" type="number" defaultValue={defaults.maxPrice} />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="minMileage">Mileage min (km)</Label>
          <Input id="minMileage" name="minMileage" type="number" defaultValue={defaults.minMileage} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="maxMileage">Mileage max (km)</Label>
          <Input id="maxMileage" name="maxMileage" type="number" defaultValue={defaults.maxMileage} />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="fuel">Fuel</Label>
          <select id="fuel" name="fuel" className={selectClassName} defaultValue={defaults.fuel ?? ""}>
            <option value="">Any</option>
            {FUEL_TYPES.map((f) => (
              <option key={f} value={f} className="capitalize">
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="transmission">Transmission</Label>
          <select
            id="transmission"
            name="transmission"
            className={selectClassName}
            defaultValue={defaults.transmission ?? ""}
          >
            <option value="">Any</option>
            {TRANSMISSIONS.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="steering">Steering</Label>
          <select id="steering" name="steering" className={selectClassName} defaultValue={defaults.steering ?? ""}>
            <option value="">Any</option>
            {STEERING_SIDES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="sort">Sort by</Label>
          <select id="sort" name="sort" className={selectClassName} defaultValue={defaults.sort ?? "newest"}>
            {Object.entries(SORT_OPTIONS).map(([key, option]) => (
              <option key={key} value={key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button asChild variant="ghost" size="sm">
          <a href="/stock">Clear</a>
        </Button>
        <Button type="submit" size="sm">
          Apply filters
        </Button>
      </div>
    </form>
  );
}
