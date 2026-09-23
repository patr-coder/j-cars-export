import { z } from "zod";

import { BODY_TYPES, DRIVE_TYPES, FUEL_TYPES, STEERING_SIDES, TRANSMISSIONS, VEHICLE_STATUSES } from "./constants";

const emptyToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v);
const optionalInt = z.preprocess(emptyToUndefined, z.coerce.number().int().optional());
const optionalText = z.preprocess(emptyToUndefined, z.string().trim().optional());
const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

export const vehicleInputSchema = z.object({
  makeId: z.string().uuid("Select a make."),
  modelId: z.string().uuid("Select a model."),
  trim: optionalText,
  year: z.coerce.number().int().min(1900).max(2100),
  month: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(12).optional()),
  priceUsd: z.coerce.number().positive(),
  salePriceUsd: z.preprocess(emptyToUndefined, z.coerce.number().positive().optional()),
  mileageKm: z.coerce.number().int().nonnegative(),
  engineCc: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
  fuelType: z.enum(FUEL_TYPES),
  transmission: z.enum(TRANSMISSIONS),
  driveType: z.enum(DRIVE_TYPES),
  steeringSide: z.enum(STEERING_SIDES),
  bodyType: z.enum(BODY_TYPES),
  color: optionalText,
  seats: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
  doors: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
  chassisNoPrivate: optionalText,
  vinPrivate: optionalText,
  widthMm: optionalInt,
  heightMm: optionalInt,
  lengthMm: optionalInt,
  weightKg: optionalInt,
  locationId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  description: optionalText,
  status: z.enum(VEHICLE_STATUSES),
  published: checkbox,
  featured: checkbox,
})
  // Mirrors the vehicles_sale_price_below_price check (migration 0013).
  .refine((v) => v.salePriceUsd === undefined || v.salePriceUsd < v.priceUsd, {
    message: "The sale price must be lower than the regular price.",
    path: ["salePriceUsd"],
  });

export type VehicleInput = z.infer<typeof vehicleInputSchema>;

export function parseVehicleForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return vehicleInputSchema.safeParse(raw);
}
