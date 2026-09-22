import { createClient } from "@/lib/supabase/server";
import type { ShippingRateForCalc } from "@/lib/pricing/calculator";

export type Country = { id: string; name: string; isoCode: string; currency: string };
export type Port = { id: string; countryId: string; name: string; code: string; active: boolean };

export async function getCountries(): Promise<Country[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("countries").select("id, name, iso_code, currency").order("name");
  if (error) throw new Error(`getCountries: ${error.message}`);
  return (data ?? []).map((c) => ({ id: c.id, name: c.name, isoCode: c.iso_code, currency: c.currency }));
}

export async function getPorts(): Promise<Port[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ports")
    .select("id, country_id, name, code, active")
    .order("name");
  if (error) throw new Error(`getPorts: ${error.message}`);
  return (data ?? []).map((p) => ({
    id: p.id,
    countryId: p.country_id,
    name: p.name,
    code: p.code,
    active: p.active,
  }));
}

export type ShippingRateOption = ShippingRateForCalc & {
  id: string;
  method: string;
  portId: string;
  portName: string;
  countryId: string;
  countryName: string;
};

const RATE_SELECT = `
  id, method, base_cost_usd, m3_rate, insurance_rate,
  inspection_fee_usd, certificate_fee_usd, local_export_fee_usd,
  destination_port:ports ( id, name, country:countries ( id, name ) )
`;

type RawRateRow = {
  id: string;
  method: string;
  base_cost_usd: number;
  m3_rate: number | null;
  insurance_rate: number | null;
  inspection_fee_usd: number | null;
  certificate_fee_usd: number | null;
  local_export_fee_usd: number | null;
  destination_port: { id: string; name: string; country: { id: string; name: string } };
};

function mapRateRow(row: RawRateRow): ShippingRateOption {
  return {
    id: row.id,
    method: row.method,
    baseCostUsd: Number(row.base_cost_usd),
    m3Rate: row.m3_rate === null ? null : Number(row.m3_rate),
    insuranceRate: row.insurance_rate === null ? null : Number(row.insurance_rate),
    inspectionFeeUsd: row.inspection_fee_usd === null ? null : Number(row.inspection_fee_usd),
    certificateFeeUsd: row.certificate_fee_usd === null ? null : Number(row.certificate_fee_usd),
    localExportFeeUsd: row.local_export_fee_usd === null ? null : Number(row.local_export_fee_usd),
    portId: row.destination_port.id,
    portName: row.destination_port.name,
    countryId: row.destination_port.country.id,
    countryName: row.destination_port.country.name,
  };
}

/** Active rates from one origin location — feeds the public price calculator. */
export async function getActiveShippingRatesForLocation(
  locationId: string,
): Promise<ShippingRateOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipping_rates")
    .select(RATE_SELECT)
    .eq("origin_location_id", locationId)
    .eq("active", true);
  if (error) throw new Error(`getActiveShippingRatesForLocation: ${error.message}`);
  return ((data as unknown as RawRateRow[]) ?? []).map(mapRateRow);
}

export type AdminShippingRate = ShippingRateOption & {
  originLocationId: string;
  originLabel: string;
  active: boolean;
};

const ADMIN_RATE_SELECT = `
  id, method, base_cost_usd, m3_rate, insurance_rate, active,
  inspection_fee_usd, certificate_fee_usd, local_export_fee_usd,
  origin:locations ( id, city, country ),
  destination_port:ports ( id, name, country:countries ( id, name ) )
`;

type RawAdminRateRow = RawRateRow & {
  active: boolean;
  origin: { id: string; city: string; country: string };
};

/** All rates (any status), for /admin/shipping — staff-scoped via RLS. */
export async function getAdminShippingRates(): Promise<AdminShippingRate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipping_rates")
    .select(ADMIN_RATE_SELECT)
    .order("active", { ascending: false });
  if (error) throw new Error(`getAdminShippingRates: ${error.message}`);
  return ((data as unknown as RawAdminRateRow[]) ?? []).map((row) => ({
    ...mapRateRow(row),
    active: row.active,
    originLocationId: row.origin.id,
    originLabel: `${row.origin.city}, ${row.origin.country}`,
  }));
}
