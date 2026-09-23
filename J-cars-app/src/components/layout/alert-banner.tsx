import Link from "next/link";

import { getSetting } from "@/lib/settings/queries";

const TONE_CLASSES = {
  info: "bg-primary text-primary-foreground",
  warning: "bg-warning text-white",
  success: "bg-success text-white",
} as const;

export async function AlertBanner() {
  const banner = await getSetting("alert_banner");
  if (!banner.enabled || !banner.message) return null;

  return (
    <div role="region" aria-label="Announcement" className={`px-4 py-2 text-center text-sm ${TONE_CLASSES[banner.tone]}`}>
      <span>{banner.message}</span>
      {banner.link_url && (
        <>
          {" "}
          <Link href={banner.link_url} className="font-semibold underline underline-offset-2">
            {banner.link_label || "Learn more"}
          </Link>
        </>
      )}
    </div>
  );
}
