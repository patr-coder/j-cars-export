import Link from "next/link";

import { Button } from "@/components/ui/button";

export function NotFoundContent({
  primaryHref = "/stock",
  primaryLabel = "Browse stock",
  secondaryHref = "/",
  secondaryLabel = "Go home",
}: {
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="mt-2 flex gap-3">
        <Button asChild>
          <Link href={primaryHref}>{primaryLabel}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
