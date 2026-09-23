import type { Metadata } from "next";

import { StockView } from "@/components/search/stock-view";
import { parseVehicleSearchParams } from "@/lib/catalog/filters";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const filters = parseVehicleSearchParams(await searchParams);
  // A make/model-only search has its own indexable page; point crawlers there
  // instead of indexing every filter combination of /stock.
  const onlyMakeModel =
    filters.make && Object.keys(filters).every((k) => k === "make" || k === "model" || k === "sort");
  const canonical = onlyMakeModel
    ? `/stock/${filters.make}${filters.model ? `/${filters.model}` : ""}`
    : "/stock";
  return {
    title: "Stock",
    description: "Browse our full stock of quality used vehicles for export.",
    alternates: { canonical },
  };
}

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  return (
    <StockView title="Stock" filters={parseVehicleSearchParams(rawParams)} rawParams={rawParams} basePath="/stock" />
  );
}
