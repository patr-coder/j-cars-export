import Link from "next/link";

import { Logo } from "@/components/layout/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-secondary/30 px-4 py-16">
      <Link href="/" aria-label="J-cars Exports home">
        <Logo height={32} />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
