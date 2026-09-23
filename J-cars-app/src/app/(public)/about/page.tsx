import type { Metadata } from "next";

import { CmsPageView } from "@/components/cms/cms-page";
import { getPublishedCmsPage } from "@/lib/settings/queries";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedCmsPage("about");
  return { title: page?.title ?? "About", alternates: { canonical: "/about" } };
}

export default async function AboutPage() {
  const page = await getPublishedCmsPage("about");
  return <CmsPageView page={page} fallbackTitle="About J-cars Exports" />;
}
