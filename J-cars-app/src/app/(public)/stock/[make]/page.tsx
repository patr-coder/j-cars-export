import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StockView } from "@/components/search/stock-view";
import { parseVehicleSearchParams } from "@/lib/catalog/filters";
import { getMakeBySlug } from "@/lib/catalog/queries";

type Params = Promise<{ make: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { make: slug } = await params;
  const make = await getMakeBySlug(slug);
  if (!make) return { title: "Make not found" };
  return {
    title: `Used ${make.name} for export`,
    description: `Browse used ${make.name} vehicles in stock, with landed-cost estimates to your port.`,
    alternates: { canonical: `/stock/${make.slug}` },
  };
}

export default async function MakeStockPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ make: slug }, rawParams] = await Promise.all([params, searchParams]);
  const make = await getMakeBySlug(slug);
  if (!make) notFound();

  return (
    <StockView
      title={`Used ${make.name} for export`}
      intro={`All ${make.name} vehicles currently in stock.`}
      filters={{ ...parseVehicleSearchParams(rawParams), make: make.slug, model: undefined }}
      rawParams={rawParams}
      basePath={`/stock/${make.slug}`}
    />
  );
}
