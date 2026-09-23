import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const rankingSchema = z.array(z.object({ label: z.string(), count: z.coerce.number() }));

// Mirrors dashboard_metrics() (migration 0013). Commerce fields are absent
// for inventory_manager.
const metricsSchema = z.object({
  active_vehicles: z.coerce.number(),
  unpublished_vehicles: z.coerce.number(),
  sold_vehicles: z.coerce.number(),
  featured_vehicles: z.coerce.number(),
  leads_today: z.coerce.number().optional(),
  leads_7d: z.coerce.number().optional(),
  open_leads: z.coerce.number().optional(),
  quotes_sent: z.coerce.number().optional(),
  active_reservations: z.coerce.number().optional(),
  pending_payments: z.coerce.number().optional(),
  revenue_usd: z.coerce.number().optional(),
  revenue_30d_usd: z.coerce.number().optional(),
  top_makes: rankingSchema.optional(),
  top_countries: rankingSchema.optional(),
});

export type DashboardMetrics = z.infer<typeof metricsSchema>;

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("dashboard_metrics");
  if (error) throw new Error(`getDashboardMetrics: ${error.message}`);
  return metricsSchema.parse(data);
}
