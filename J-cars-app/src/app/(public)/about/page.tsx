import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-2xl font-semibold">About J-cars Exports</h1>
      <p className="mt-2 text-muted-foreground">
        Company story and trust signals — editable from the admin CMS in a
        later phase.
      </p>
    </div>
  );
}
