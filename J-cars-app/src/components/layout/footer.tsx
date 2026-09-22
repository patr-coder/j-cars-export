import Link from "next/link";

import { Logo } from "@/components/layout/logo";

const FOOTER_LINKS = [
  { href: "/stock", label: "Browse stock" },
  { href: "/how-to-buy", label: "How to buy" },
  { href: "/shipping", label: "Shipping & costs" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-secondary/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <Logo height={32} />
          <p className="max-w-sm text-sm text-muted-foreground">
            Quality used vehicles, exported worldwide.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} J-cars Exports. All rights reserved.
      </div>
    </footer>
  );
}
