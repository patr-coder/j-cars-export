import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Contact</h1>
      <p className="mt-2 text-muted-foreground">
        Contact form and WhatsApp link land alongside the inquiry workflow in
        Phase 3.
      </p>
    </div>
  );
}
