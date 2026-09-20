import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-24">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Quality used vehicles,
        <br />
        exported worldwide.
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Browse our stock, get a landed-cost estimate, and track your vehicle
        from Japan to your port. The full catalogue and search experience
        land in the next phase — this page is the Phase 0 foundation.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/stock">Browse stock</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/how-to-buy">How it works</Link>
        </Button>
      </div>
    </section>
  );
}
