// Pure function, no Supabase import — used identically by the public
// price calculator (client component, spec §3.4) and the admin quote
// form (src/actions/quotes.ts), so there is exactly one implementation
// of "how a quote total is computed".

export type ShippingRateForCalc = {
  baseCostUsd: number;
  m3Rate: number | null;
  insuranceRate: number | null;
  inspectionFeeUsd: number | null;
  certificateFeeUsd: number | null;
  localExportFeeUsd: number | null;
};

export type QuoteOptions = {
  insurance: boolean;
  inspection: boolean;
  certificate: boolean;
};

export type QuoteBreakdown = {
  vehiclePrice: number;
  freight: number;
  insurance: number;
  inspection: number;
  certificate: number;
  localExportFee: number;
  total: number;
};

export function calculateQuoteTotal(
  vehiclePriceUsd: number,
  rate: ShippingRateForCalc,
  options: QuoteOptions,
): QuoteBreakdown {
  const freight = rate.baseCostUsd;
  const insurance = options.insurance ? (rate.insuranceRate ?? 0) * vehiclePriceUsd : 0;
  const inspection = options.inspection ? (rate.inspectionFeeUsd ?? 0) : 0;
  const certificate = options.certificate ? (rate.certificateFeeUsd ?? 0) : 0;
  const localExportFee = rate.localExportFeeUsd ?? 0;

  return {
    vehiclePrice: vehiclePriceUsd,
    freight,
    insurance,
    inspection,
    certificate,
    localExportFee,
    total: vehiclePriceUsd + freight + insurance + inspection + certificate + localExportFee,
  };
}
