import Image from "next/image";

// Source: Logo/logo-transparent-pdf.pdf, exported to public/brand/.
// Single swap point if the brand asset is ever replaced.
const ASPECT_RATIO = 4625 / 1665;

export function Logo({
  height = 28,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <Image
      src="/brand/jcars-logo.svg"
      alt="J-cars Exports"
      width={Math.round(height * ASPECT_RATIO)}
      height={height}
      unoptimized
      priority
      className={className}
    />
  );
}
