import type { Metadata } from "next";

export const metadata: Metadata = { title: "How to Buy" };

export default function HowToBuyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="text-2xl font-semibold">How to Buy</h1>
      <p className="mt-2 text-muted-foreground">
        Step-by-step purchase guide — editable from the admin CMS in a later
        phase.
      </p>
    </div>
  );
}
