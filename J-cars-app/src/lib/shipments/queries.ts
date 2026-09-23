import { signOrderFileUrls } from "@/lib/storage/order-files";
import { createClient } from "@/lib/supabase/server";

export type Shipment = {
  carrier: string | null;
  vesselName: string | null;
  voyageNo: string | null;
  bookingNo: string | null;
  originPort: string | null;
  destinationPort: string | null;
  etd: string | null;
  eta: string | null;
  status: string;
  trackingUrl: string | null;
};

export async function getShipment(orderId: string): Promise<Shipment | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipments")
    .select(
      "carrier, vessel_name, voyage_no, booking_no, origin_port, destination_port, etd, eta, status, tracking_url",
    )
    .eq("order_id", orderId)
    .maybeSingle();
  if (error) throw new Error(`getShipment: ${error.message}`);
  if (!data) return null;
  return {
    carrier: data.carrier,
    vesselName: data.vessel_name,
    voyageNo: data.voyage_no,
    bookingNo: data.booking_no,
    originPort: data.origin_port,
    destinationPort: data.destination_port,
    etd: data.etd,
    eta: data.eta,
    status: data.status,
    trackingUrl: data.tracking_url,
  };
}

export type OrderDocument = {
  id: string;
  kind: string;
  title: string;
  url: string | null;
  createdAt: string;
};

export async function getOrderDocuments(orderId: string): Promise<OrderDocument[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_documents")
    .select("id, kind, title, storage_path, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`getOrderDocuments: ${error.message}`);

  const rows = data ?? [];
  const urls = await signOrderFileUrls(
    supabase,
    rows.map((r) => r.storage_path),
  );
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    title: row.title,
    url: urls.get(row.storage_path) ?? null,
    createdAt: row.created_at,
  }));
}
