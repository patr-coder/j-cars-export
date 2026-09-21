"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { VehicleActionState } from "@/actions/vehicles";
import type { AdminVehicleDetail } from "@/lib/catalog/queries";
import {
  BODY_TYPES,
  DRIVE_TYPES,
  FUEL_TYPES,
  STEERING_SIDES,
  TRANSMISSIONS,
  VEHICLE_STATUSES,
} from "@/lib/catalog/constants";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

const initialState: VehicleActionState = { error: null };

type Make = { id: string; name: string; slug: string };
type Model = { id: string; makeId: string; name: string; slug: string };
type LocationOption = { id: string; city: string; country: string };

export function VehicleForm({
  mode,
  vehicle,
  makes,
  models,
  locations,
  action,
}: {
  mode: "create" | "edit";
  vehicle?: AdminVehicleDetail;
  makes: Make[];
  models: Model[];
  locations: LocationOption[];
  action: (prevState: VehicleActionState, formData: FormData) => Promise<VehicleActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [selectedMake, setSelectedMake] = useState(vehicle?.makeId ?? "");
  const visibleModels = selectedMake ? models.filter((m) => m.makeId === selectedMake) : models;

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      {vehicle && (
        <div className="flex flex-col gap-1">
          <Label>Reference number</Label>
          <Input value={vehicle.refNo} disabled readOnly />
        </div>
      )}

      <fieldset className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <legend className="mb-2 text-sm font-semibold">Identification</legend>
        <div className="flex flex-col gap-1">
          <Label htmlFor="makeId">Make</Label>
          <select
            id="makeId"
            name="makeId"
            required
            className={selectClassName}
            defaultValue={vehicle?.makeId ?? ""}
            onChange={(e) => setSelectedMake(e.target.value)}
          >
            <option value="" disabled>
              Select make
            </option>
            {makes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="modelId">Model</Label>
          <select
            id="modelId"
            name="modelId"
            required
            className={selectClassName}
            defaultValue={vehicle?.modelId ?? ""}
          >
            <option value="" disabled>
              Select model
            </option>
            {visibleModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="trim">Trim</Label>
          <Input id="trim" name="trim" defaultValue={vehicle?.trim ?? ""} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="year">Year</Label>
          <Input id="year" name="year" type="number" required defaultValue={vehicle?.year} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="month">Month</Label>
          <Input id="month" name="month" type="number" min={1} max={12} defaultValue={vehicle?.month ?? ""} />
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <legend className="mb-2 text-sm font-semibold">Pricing &amp; mileage</legend>
        <div className="flex flex-col gap-1">
          <Label htmlFor="priceUsd">Price (USD)</Label>
          <Input id="priceUsd" name="priceUsd" type="number" step="0.01" required defaultValue={vehicle?.priceUsd} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="salePriceUsd">Sale price (USD)</Label>
          <Input
            id="salePriceUsd"
            name="salePriceUsd"
            type="number"
            step="0.01"
            defaultValue={vehicle?.salePriceUsd ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="mileageKm">Mileage (km)</Label>
          <Input id="mileageKm" name="mileageKm" type="number" required defaultValue={vehicle?.mileageKm} />
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <legend className="mb-2 text-sm font-semibold">Specification</legend>
        <div className="flex flex-col gap-1">
          <Label htmlFor="engineCc">Engine (cc)</Label>
          <Input id="engineCc" name="engineCc" type="number" defaultValue={vehicle?.engineCc ?? ""} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="fuelType">Fuel</Label>
          <select id="fuelType" name="fuelType" required className={selectClassName} defaultValue={vehicle?.fuelType ?? ""}>
            <option value="" disabled>
              Select
            </option>
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
            required
            className={selectClassName}
            defaultValue={vehicle?.transmission ?? ""}
          >
            <option value="" disabled>
              Select
            </option>
            {TRANSMISSIONS.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="driveType">Drive</Label>
          <select
            id="driveType"
            name="driveType"
            required
            className={selectClassName + " uppercase"}
            defaultValue={vehicle?.driveType ?? ""}
          >
            <option value="" disabled>
              Select
            </option>
            {DRIVE_TYPES.map((d) => (
              <option key={d} value={d} className="uppercase">
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="steeringSide">Steering</Label>
          <select
            id="steeringSide"
            name="steeringSide"
            required
            className={selectClassName}
            defaultValue={vehicle?.steeringSide ?? ""}
          >
            <option value="" disabled>
              Select
            </option>
            {STEERING_SIDES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="bodyType">Body type</Label>
          <select id="bodyType" name="bodyType" required className={selectClassName} defaultValue={vehicle?.bodyType ?? ""}>
            <option value="" disabled>
              Select
            </option>
            {BODY_TYPES.map((b) => (
              <option key={b} value={b} className="capitalize">
                {b}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="color">Color</Label>
          <Input id="color" name="color" defaultValue={vehicle?.color ?? ""} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="seats">Seats</Label>
          <Input id="seats" name="seats" type="number" defaultValue={vehicle?.seats ?? ""} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="doors">Doors</Label>
          <Input id="doors" name="doors" type="number" defaultValue={vehicle?.doors ?? ""} />
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <legend className="mb-2 text-sm font-semibold">Dimensions (mm) &amp; weight (kg)</legend>
        <div className="flex flex-col gap-1">
          <Label htmlFor="widthMm">Width</Label>
          <Input id="widthMm" name="widthMm" type="number" defaultValue={vehicle?.widthMm ?? ""} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="heightMm">Height</Label>
          <Input id="heightMm" name="heightMm" type="number" defaultValue={vehicle?.heightMm ?? ""} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="lengthMm">Length</Label>
          <Input id="lengthMm" name="lengthMm" type="number" defaultValue={vehicle?.lengthMm ?? ""} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="weightKg">Weight</Label>
          <Input id="weightKg" name="weightKg" type="number" defaultValue={vehicle?.weightKg ?? ""} />
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="mb-2 text-sm font-semibold">
          Internal only <span className="font-normal text-muted-foreground">(never shown publicly)</span>
        </legend>
        <div className="flex flex-col gap-1">
          <Label htmlFor="chassisNoPrivate">Chassis number</Label>
          <Input id="chassisNoPrivate" name="chassisNoPrivate" defaultValue={vehicle?.chassisNoPrivate ?? ""} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="vinPrivate">VIN</Label>
          <Input id="vinPrivate" name="vinPrivate" defaultValue={vehicle?.vinPrivate ?? ""} />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-semibold">Location &amp; description</legend>
        <div className="flex flex-col gap-1">
          <Label htmlFor="locationId">Location</Label>
          <select id="locationId" name="locationId" className={selectClassName} defaultValue={vehicle?.locationId ?? ""}>
            <option value="">None</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.city}, {l.country}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={5} defaultValue={vehicle?.description ?? ""} />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-semibold">Status &amp; visibility</legend>
        <div className="flex flex-col gap-1 sm:w-64">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" required className={selectClassName} defaultValue={vehicle?.status ?? "available"}>
            {VEHICLE_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="published" name="published" defaultChecked={vehicle?.published ?? false} />
          <Label htmlFor="published" className="font-normal">
            Published (visible on the public site)
          </Label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="featured" name="featured" defaultChecked={vehicle?.featured ?? false} />
          <Label htmlFor="featured" className="font-normal">
            Featured
          </Label>
        </div>
      </fieldset>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : mode === "create" ? "Create vehicle" : "Save changes"}
      </Button>
    </form>
  );
}
