import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StockView } from "@/components/search/stock-view";
import { parseVehicleSearchParams } from "@/lib/catalog/filters";
import { getMakeBySlug, getModelBySlug } from "@/lib/catalog/queries";

type Params = Promise<{ make: string; model: string }>;

async function load(params: Params) {
  const { make: makeSlug, model: modelSlug } = await params;
  const make = await getMakeBySlug(makeSlug);
  const model = make ? await getModelBySlug(make.id, modelSlug) : null;
  return make && model ? { make, model } : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const found = await load(params);
  if (!found) return { title: "Model not found" };
  const name = `${found.make.name} ${found.model.name}`;
  return {
    title: `Used ${name} for export`,
    description: `Browse used ${name} vehicles in stock, with landed-cost estimates to your port.`,
    alternates: { canonical: `/stock/${found.make.slug}/${found.model.slug}` },
  };
}

export default async function ModelStockPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [found, rawParams] = await Promise.all([load(params), searchParams]);
  if (!found) notFound();
  const { make, model } = found;

  return (
    <StockView
      title={`Used ${make.name} ${model.name} for export`}
      intro={`All ${make.name} ${model.name} vehicles currently in stock.`}
      filters={{ ...parseVehicleSearchParams(rawParams), make: make.slug, model: model.slug }}
      rawParams={rawParams}
      basePath={`/stock/${make.slug}/${model.slug}`}
    />
  );
}
