export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Vehicle: {slug}</h1>
      <p className="mt-2 text-muted-foreground">
        The vehicle detail page (gallery, specs, quote CTA) lands in Phase 1.
      </p>
    </div>
  );
}
