import { z } from "zod";

export const PAGE_SIZE = 20;

const SORT_KEYS = [
  "newest",
  "price_asc",
  "price_desc",
  "year_desc",
  "mileage_asc",
] as const;

export type SortKey = (typeof SORT_KEYS)[number];

export const SORT_OPTIONS: Record<
  SortKey,
  {
    label: string;
    column: "created_at" | "price_usd" | "year" | "mileage_km";
    ascending: boolean;
  }
> = {
  newest: { label: "Newest", column: "created_at", ascending: false },
  price_asc: { label: "Price: Low to High", column: "price_usd", ascending: true },
  price_desc: { label: "Price: High to Low", column: "price_usd", ascending: false },
  year_desc: { label: "Year: Newest first", column: "year", ascending: false },
  mileage_asc: { label: "Mileage: Lowest first", column: "mileage_km", ascending: true },
};

// Spec §3.2 also lists cylindrée/seats/color/status/date-added as
// filterable — left out of the UI for now to keep the form usable; adding
// one is a one-line addition here plus a matching `if` in getVehicles().
const searchParamsSchema = z.object({
  q: z.string().trim().min(1).optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  minYear: z.coerce.number().int().optional(),
  maxYear: z.coerce.number().int().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minMileage: z.coerce.number().nonnegative().optional(),
  maxMileage: z.coerce.number().nonnegative().optional(),
  fuel: z.string().optional(),
  transmission: z.string().optional(),
  bodyType: z.string().optional(),
  steering: z.string().optional(),
  location: z.string().optional(),
  promotion: z.literal("1").optional(),
  sort: z.enum(SORT_KEYS).optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export type VehicleSearchParams = z.infer<typeof searchParamsSchema>;

export function parseVehicleSearchParams(
  raw: Record<string, string | string[] | undefined>,
): VehicleSearchParams {
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    const single = Array.isArray(value) ? value[0] : value;
    flat[key] = single === "" ? undefined : single;
  }
  const parsed = searchParamsSchema.safeParse(flat);
  return parsed.success ? parsed.data : {};
}
