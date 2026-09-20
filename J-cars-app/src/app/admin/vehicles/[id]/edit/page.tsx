export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Edit vehicle {id}</h1>
      <p className="mt-2 text-muted-foreground">The vehicle edit form lands in Phase 2.</p>
    </div>
  );
}
