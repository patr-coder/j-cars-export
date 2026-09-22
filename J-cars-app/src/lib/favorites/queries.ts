import {
  mapVehicleListRow,
  VEHICLE_LIST_SELECT,
  type RawVehicleListRow,
  type VehicleListItem,
} from "@/lib/catalog/queries";
import { createClient } from "@/lib/supabase/server";

export async function getFavoriteVehicleIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("favorites").select("vehicle_id").eq("user_id", userId);
  if (error) throw new Error(`getFavoriteVehicleIds: ${error.message}`);
  return new Set((data ?? []).map((row) => row.vehicle_id));
}

export async function getFavoriteVehicles(userId: string): Promise<VehicleListItem[]> {
  const supabase = await createClient();
  const { data: favorites, error: favoritesError } = await supabase
    .from("favorites")
    .select("vehicle_id")
    .eq("user_id", userId);
  if (favoritesError) throw new Error(`getFavoriteVehicles: ${favoritesError.message}`);
  const vehicleIds = (favorites ?? []).map((row) => row.vehicle_id);
  if (vehicleIds.length === 0) return [];

  const { data, error } = await supabase
    .from("vehicles")
    .select(VEHICLE_LIST_SELECT)
    .in("id", vehicleIds)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`getFavoriteVehicles: ${error.message}`);
  return ((data as unknown as RawVehicleListRow[]) ?? []).map(mapVehicleListRow);
}
