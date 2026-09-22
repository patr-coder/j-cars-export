import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shipping" };

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Shipping</h1>
      <p className="mt-2 text-muted-foreground">
        Destination countries, ports, and the landed-cost calculator land in
        Phase 3.
      </p>
    </div>
  );
}
