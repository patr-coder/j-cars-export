import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { whatsappHref } from "@/lib/contact/whatsapp";
import { getSetting } from "@/lib/settings/queries";

const FOOTER_LINKS = [
  { href: "/stock", label: "Browse stock" },
  { href: "/how-to-buy", label: "How to buy" },
  { href: "/shipping", label: "Shipping & costs" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
];

const SOCIAL_LABELS = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  x: "X",
} as const;

export async function Footer() {
  const contact = await getSetting("contact");
  const whatsapp = whatsappHref(contact.whatsapp);
  const socials = (Object.keys(SOCIAL_LABELS) as (keyof typeof SOCIAL_LABELS)[]).filter((k) => contact[k]);

  return (
    <footer className="mt-auto border-t bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Logo height={32} />
          <p className="max-w-sm text-sm text-muted-foreground">Quality used vehicles, exported worldwide.</p>
        </div>

        <nav className="flex flex-col gap-2" aria-label="Footer">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <address className="flex flex-col gap-2 text-sm text-muted-foreground not-italic">
          {contact.address && <p className="whitespace-pre-line">{contact.address}</p>}
          {contact.phone && (
            <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="hover:text-foreground">
              {contact.phone}
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="hover:text-foreground">
              {contact.email}
            </a>
          )}
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              WhatsApp {contact.whatsapp}
            </a>
          )}
          {socials.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-3" aria-label="Social media">
              {socials.map((key) => (
                <li key={key}>
                  <a href={contact[key]} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                    {SOCIAL_LABELS[key]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </address>
      </div>
      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} J-cars Exports. All rights reserved.
      </div>
    </footer>
  );
}
