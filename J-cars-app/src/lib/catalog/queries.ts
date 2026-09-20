import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

import { PAGE_SIZE, SORT_OPTIONS, type VehicleSearchParams } from "./filters";
import { buildVehicleSlug, parseRefFromSlug } from "./slug";

type Enums = Database["public"]["Enums"];

export type VehicleListItem = {
  id: string;
  refNo: string;
  slug: string;
  makeName: string;
  modelName: string;
  trim: string | null;
  year: number;
  mileageKm: number;
  priceUsd: number;
  salePriceUsd: number | null;
  fuelType: string;
  transmission: string;
  bodyType: string;
  status: string;
  primaryImageUrl: string | null;
};

export type VehicleDetail = VehicleListItem & {
  month: number | null;
  engineCc: number | null;
  driveType: string;
  steeringSide: string;
  color: string | null;
  seats: number | null;
  doors: number | null;
  widthMm: number | null;
  heightMm: number | null;
  lengthMm: number | null;
  weightKg: number | null;
  description: string | null;
  locationLabel: string | null;
  images: { url: string; alt: string | null; isPrimary: boolean }[];
  createdAt: string;
};

const LIST_SELECT = `
  id, ref_no, trim, year, price_usd, sale_price_usd, mileage_km,
  fuel_type, transmission, body_type, status, created_at,
  make:makes ( name, slug ),
  model:models ( name, slug ),
  vehicle_images ( public_url, is_primary, sort_order )
`;

type ImageRow = { public_url: string; is_primary: boolean; sort_order: number };

// Raw shapes from the two `.select()` strings above — cast to these rather
// than fighting Supabase's embedded-relation type inference (see
// DECISIONS.md re: the seed script's earlier friction with the same thing).
type RawListRow = {
  id: string;
  ref_no: string;
  trim: string | null;
  year: number;
  price_usd: number;
  sale_price_usd: number | null;
  mileage_km: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  status: string;
  created_at: string;
  make: { name: string; slug: string };
  model: { name: string; slug: string };
  vehicle_images: ImageRow[];
};

function sortedImages<T extends ImageRow>(images: T[] | null | undefined): T[] {
  return [...(images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
  );
}

function mapListRow(row: RawListRow): VehicleListItem {
  return {
    id: row.id,
    refNo: row.ref_no,
    slug: buildVehicleSlug({
      makeSlug: row.make.slug,
      modelSlug: row.model.slug,
      refNo: row.ref_no,
    }),
    makeName: row.make.name,
    modelName: row.model.name,
    trim: row.trim,
    year: row.year,
    mileageKm: row.mileage_km,
    priceUsd: Number(row.price_usd),
    salePriceUsd: row.sale_price_usd === null ? null : Number(row.sale_price_usd),
    fuelType: row.fuel_type,
    transmission: row.transmission,
    bodyType: row.body_type,
    status: row.status,
    primaryImageUrl: sortedImages(row.vehicle_images)[0]?.public_url ?? null,
  };
}

export async function getVehicleStats(): Promise<{ availableCount: number }> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("published", true)
    .is("deleted_at", null);
  return { availableCount: count ?? 0 };
}

export async function getRecentVehicles(limit = 6): Promise<VehicleListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select(LIST_SELECT)
    .eq("published", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getRecentVehicles: ${error.message}`);
  return ((data as unknown as RawListRow[]) ?? []).map(mapListRow);
}

export async function getVehicles(params: VehicleSearchParams): Promise<{
  vehicles: VehicleListItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const sortOption = SORT_OPTIONS[params.sort ?? "newest"];

  let query = supabase
    .from("vehicles")
    .select(LIST_SELECT, { count: "exact" })
    .eq("published", true)
    .is("deleted_at", null);

  if (params.q) query = query.ilike("description", `%${params.q}%`);
  if (params.minYear !== undefined) query = query.gte("year", params.minYear);
  if (params.maxYear !== undefined) query = query.lte("year", params.maxYear);
  if (params.minPrice !== undefined) query = query.gte("price_usd", params.minPrice);
  if (params.maxPrice !== undefined) query = query.lte("price_usd", params.maxPrice);
  if (params.minMileage !== undefined) query = query.gte("mileage_km", params.minMileage);
  if (params.maxMileage !== undefined) query = query.lte("mileage_km", params.maxMileage);
  if (params.fuel) query = query.eq("fuel_type", params.fuel as Enums["fuel_type"]);
  if (params.transmission)
    query = query.eq("transmission", params.transmission as Enums["transmission_type"]);
  if (params.bodyType) query = query.eq("body_type", params.bodyType as Enums["body_type"]);
  if (params.steering) query = query.eq("steering_side", params.steering as Enums["steering_side"]);
  if (params.location) query = query.eq("location_id", params.location);

  if (params.make) {
    const { data: make } = await supabase
      .from("makes")
      .select("id")
      .eq("slug", params.make)
      .maybeSingle();
    if (make) {
      query = query.eq("make_id", make.id);
      if (params.model) {
        const { data: model } = await supabase
          .from("models")
          .select("id")
          .eq("make_id", make.id)
          .eq("slug", params.model)
          .maybeSingle();
        if (model) query = query.eq("model_id", model.id);
      }
    }
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error, count } = await query
    .order(sortOption.column, { ascending: sortOption.ascending })
    .range(from, to);
  if (error) throw new Error(`getVehicles: ${error.message}`);

  return {
    vehicles: ((data as unknown as RawListRow[]) ?? []).map(mapListRow),
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  };
}

export async function getVehicleBySlug(slug: string): Promise<VehicleDetail | null> {
  const supabase = await createClient();
  const refNo = parseRefFromSlug(slug);

  const { data, error } = await supabase
    .from("vehicles")
    .select(`
      id, ref_no, trim, year, month, price_usd, sale_price_usd, mileage_km,
      engine_cc, fuel_type, transmission, drive_type, steering_side, body_type,
      color, seats, doors, width_mm, height_mm, length_mm, weight_kg,
      description, status, created_at,
      make:makes ( name, slug ),
      model:models ( name, slug ),
      location:locations ( city, country, yard_name ),
      vehicle_images ( public_url, alt_text, is_primary, sort_order )
    `)
    .eq("ref_no", refNo)
    .eq("published", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw new Error(`getVehicleBySlug: ${error.message}`);
  if (!data) return null;

  const row = data as unknown as {
    id: string;
    ref_no: string;
    trim: string | null;
    year: number;
    month: number | null;
    price_usd: number;
    sale_price_usd: number | null;
    mileage_km: number;
    engine_cc: number | null;
    fuel_type: string;
    transmission: string;
    drive_type: string;
    steering_side: string;
    body_type: string;
    color: string | null;
    seats: number | null;
    doors: number | null;
    width_mm: number | null;
    height_mm: number | null;
    length_mm: number | null;
    weight_kg: number | null;
    description: string | null;
    status: string;
    created_at: string;
    make: { name: string; slug: string };
    model: { name: string; slug: string };
    location: { city: string; country: string; yard_name: string } | null;
    vehicle_images: (ImageRow & { alt_text: string | null })[];
  };

  const images = sortedImages(row.vehicle_images);

  return {
    id: row.id,
    refNo: row.ref_no,
    slug: buildVehicleSlug({ makeSlug: row.make.slug, modelSlug: row.model.slug, refNo: row.ref_no }),
    makeName: row.make.name,
    modelName: row.model.name,
    trim: row.trim,
    year: row.year,
    month: row.month,
    mileageKm: row.mileage_km,
    priceUsd: Number(row.price_usd),
    salePriceUsd: row.sale_price_usd === null ? null : Number(row.sale_price_usd),
    engineCc: row.engine_cc,
    fuelType: row.fuel_type,
    transmission: row.transmission,
    driveType: row.drive_type,
    steeringSide: row.steering_side,
    bodyType: row.body_type,
    color: row.color,
    seats: row.seats,
    doors: row.doors,
    widthMm: row.width_mm,
    heightMm: row.height_mm,
    lengthMm: row.length_mm,
    weightKg: row.weight_kg,
    description: row.description,
    status: row.status,
    locationLabel: row.location ? `${row.location.city}, ${row.location.country}` : null,
    images: images.map((img) => ({ url: img.public_url, alt: img.alt_text, isPrimary: img.is_primary })),
    primaryImageUrl: images[0]?.public_url ?? null,
    createdAt: row.created_at,
  };
}

export async function getMakes(): Promise<{ id: string; name: string; slug: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("makes").select("id, name, slug").order("name");
  if (error) throw new Error(`getMakes: ${error.message}`);
  return data ?? [];
}

export async function getModels(): Promise<
  { id: string; makeId: string; name: string; slug: string }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("models")
    .select("id, make_id, name, slug")
    .order("name");
  if (error) throw new Error(`getModels: ${error.message}`);
  return (data ?? []).map((m) => ({ id: m.id, makeId: m.make_id, name: m.name, slug: m.slug }));
}

export async function getLocations(): Promise<{ id: string; city: string; country: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("locations").select("id, city, country").order("city");
  if (error) throw new Error(`getLocations: ${error.message}`);
  return data ?? [];
}

