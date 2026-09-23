import type { Metadata } from "next";
import Link from "next/link";

import { CmsPageView } from "@/components/cms/cms-page";
import { Button } from "@/components/ui/button";
import { getPublishedCmsPage } from "@/lib/settings/queries";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedCmsPage("how-to-buy");
  return { title: page?.title ?? "How to Buy", alternates: { canonical: "/how-to-buy" } };
}

export default async function HowToBuyPage() {
  const page = await getPublishedCmsPage("how-to-buy");
  return (
    <CmsPageView page={page} fallbackTitle="How to Buy">
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/stock">Browse stock</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/contact">Ask a question</Link>
        </Button>
      </div>
    </CmsPageView>
  );
}
