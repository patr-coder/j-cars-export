import { notFound } from "next/navigation";

import { deleteVehicle, duplicateVehicle, updateVehicle } from "@/actions/vehicles";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PhotoManager } from "@/components/admin/photo-manager";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { Button } from "@/components/ui/button";
import { getAdminVehicleById, getLocations, getMakes, getModels } from "@/lib/catalog/queries";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [vehicle, makes, models, locations] = await Promise.all([
    getAdminVehicleById(id),
    getMakes(),
    getModels(),
    getLocations(),
  ]);

  if (!vehicle) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {vehicle.refNo} — edit
        </h1>
        <div className="flex gap-2">
          <form action={duplicateVehicle.bind(null, id)}>
            <Button type="submit" variant="outline" size="sm">
              Duplicate
            </Button>
          </form>
          <form action={deleteVehicle.bind(null, id)}>
            <ConfirmSubmitButton
              type="submit"
              variant="destructive"
              size="sm"
              confirmMessage={`Delete ${vehicle.refNo}? This can't be undone from the admin UI.`}
            >
              Delete
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>

      <VehicleForm
        mode="edit"
        vehicle={vehicle}
        makes={makes}
        models={models}
        locations={locations}
        action={updateVehicle.bind(null, id)}
      />

      <div className="max-w-3xl">
        <h2 className="mb-3 text-lg font-semibold">Photos</h2>
        <PhotoManager vehicleId={id} images={vehicle.images} />
      </div>
    </div>
  );
}
