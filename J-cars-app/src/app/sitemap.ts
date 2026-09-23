import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";
import { buildVehicleSlug } from "@/lib/catalog/slug";

const STATIC_PAGES = ["", "/stock", "/how-to-buy", "/shipping", "/about", "/contact"];

type SitemapVehicle = {
  ref_no: string;
  updated_at: string;
  make: { slug: string };
  model: { slug: string };
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();

  const { data } = await supabase
    .from("vehicles")
    .select("ref_no, updated_at, make:makes(slug), model:models(slug)")
    .eq("published", true)
    .is("deleted_at", null);
  const vehicles = (data as unknown as SitemapVehicle[]) ?? [];

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "daily",
  }));

  // Only brand/model pages that currently list something.
  const makeModelPaths = new Set<string>();
  for (const v of vehicles) {
    makeModelPaths.add(`/stock/${v.make.slug}`);
    makeModelPaths.add(`/stock/${v.make.slug}/${v.model.slug}`);
  }
  const makeModelEntries: MetadataRoute.Sitemap = [...makeModelPaths].sort().map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "daily",
  }));

  const vehicleEntries: MetadataRoute.Sitemap = vehicles.map((v) => ({
    url: `${siteUrl}/cars/${buildVehicleSlug({ makeSlug: v.make.slug, modelSlug: v.model.slug, refNo: v.ref_no })}`,
    lastModified: new Date(v.updated_at),
    changeFrequency: "weekly",
  }));

  return [...staticEntries, ...makeModelEntries, ...vehicleEntries];
}
