import Image from "next/image";

export function VehicleGallery({
  images,
  alt,
}: {
  images: { url: string; alt: string | null }[];
  alt: string;
}) {
  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-muted text-muted-foreground">
        No photos yet
      </div>
    );
  }

  const [main, ...rest] = images;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
        <Image
          src={main.url}
          alt={main.alt ?? alt}
          fill
          unoptimized
          priority
          className="object-cover"
        />
      </div>
      {rest.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {rest.map((img) => (
            <div key={img.url} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
              <Image src={img.url} alt={img.alt ?? alt} fill unoptimized className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
