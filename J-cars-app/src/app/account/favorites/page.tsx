import { VehicleCard } from "@/components/vehicle/vehicle-card";
import { getCurrentUser } from "@/lib/auth/session";
import { getFavoriteVehicles } from "@/lib/favorites/queries";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  const vehicles = user ? await getFavoriteVehicles(user.id) : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Favorites</h1>
      <p className="mt-2 text-muted-foreground">Vehicles you&apos;ve saved for later.</p>

      {vehicles.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          You haven&apos;t saved any vehicles yet — tap the heart on a listing to save it here.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} isFavorited isSignedIn />
          ))}
        </div>
      )}
    </div>
  );
}
