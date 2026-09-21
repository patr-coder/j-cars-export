"use client";

import Image from "next/image";
import { useState } from "react";

import {
  deleteVehicleImage,
  moveVehicleImage,
  setPrimaryVehicleImage,
  updateVehicleImageAlt,
  uploadVehicleImages,
} from "@/actions/vehicle-images";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminVehicleImage } from "@/lib/catalog/queries";

export function PhotoManager({
  vehicleId,
  images,
}: {
  vehicleId: string;
  images: AdminVehicleImage[];
}) {
  const [previews, setPreviews] = useState<string[]>([]);

  return (
    <div className="flex flex-col gap-4">
      <form
        action={uploadVehicleImages.bind(null, vehicleId)}
        className="flex flex-col gap-2 rounded-xl border p-4"
      >
        <label htmlFor="files" className="text-sm font-medium">
          Upload photos
        </label>
        <input
          id="files"
          name="files"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            setPreviews(files.map((f) => URL.createObjectURL(f)));
          }}
          className="text-sm"
        />
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {previews.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- transient blob: preview, not a served asset
              <img key={i} src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
            ))}
          </div>
        )}
        <Button type="submit" size="sm" className="w-fit">
          Upload
        </Button>
      </form>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((image, index) => (
            <div key={image.id} className="flex flex-col gap-2 rounded-xl border p-3">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <Image src={image.url} alt={image.alt ?? ""} fill unoptimized className="object-cover" />
                {image.isPrimary && (
                  <span className="absolute left-1 top-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    Primary
                  </span>
                )}
              </div>

              <form action={updateVehicleImageAlt.bind(null, image.id, vehicleId)} className="flex gap-1">
                <Input name="altText" defaultValue={image.alt ?? ""} placeholder="Alt text" className="h-7 text-xs" />
                <Button type="submit" size="xs" variant="outline">
                  Save
                </Button>
              </form>

              <div className="flex flex-wrap gap-1">
                {!image.isPrimary && (
                  <form action={setPrimaryVehicleImage.bind(null, image.id, vehicleId)}>
                    <Button type="submit" size="xs" variant="outline">
                      Set primary
                    </Button>
                  </form>
                )}
                <form action={moveVehicleImage.bind(null, vehicleId, image.id, "up")}>
                  <Button type="submit" size="xs" variant="outline" disabled={index === 0}>
                    ↑
                  </Button>
                </form>
                <form action={moveVehicleImage.bind(null, vehicleId, image.id, "down")}>
                  <Button type="submit" size="xs" variant="outline" disabled={index === images.length - 1}>
                    ↓
                  </Button>
                </form>
                <form action={deleteVehicleImage.bind(null, image.id, vehicleId)}>
                  <ConfirmSubmitButton
                    type="submit"
                    size="xs"
                    variant="destructive"
                    confirmMessage="Delete this photo?"
                  >
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
