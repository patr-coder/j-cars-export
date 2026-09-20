import type { Metadata } from "next";

export const metadata: Metadata = { title: "Stock" };

export default function StockPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Stock</h1>
      <p className="mt-2 text-muted-foreground">
        The searchable catalogue (filters, sorting, pagination) lands in
        Phase 1.
      </p>
    </div>
  );
}
