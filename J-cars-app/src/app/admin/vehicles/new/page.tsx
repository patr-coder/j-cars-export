import { createVehicle } from "@/actions/vehicles";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { getLocations, getMakes, getModels } from "@/lib/catalog/queries";

export default async function NewVehiclePage() {
  const [makes, models, locations] = await Promise.all([getMakes(), getModels(), getLocations()]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New vehicle</h1>
      <VehicleForm mode="create" makes={makes} models={models} locations={locations} action={createVehicle} />
    </div>
  );
}
