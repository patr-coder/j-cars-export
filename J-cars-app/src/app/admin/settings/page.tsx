import Link from "next/link";

import { updateBankDetails, updateContactSettings } from "@/actions/cms";
import { FlashMessage } from "@/components/admin/flash-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth/roles";
import { getSetting } from "@/lib/settings/queries";

function Field({
  id,
  name,
  label,
  defaultValue,
  placeholder,
  type = "text",
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} />
    </div>
  );
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requireRole(["admin"]);
  const { error, saved } = await searchParams;
  const [contact, bank] = await Promise.all([getSetting("contact"), getSetting("bank_details")]);
  const bankIsPlaceholder = Object.values(bank).some((v) => v.includes("TO BE CONFIGURED"));

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Staff roles are managed under{" "}
          <Link href="/admin/customers" className="text-primary hover:underline">Customers</Link>, and every change is
          recorded in the <Link href="/admin/audit" className="text-primary hover:underline">audit log</Link>.
        </p>
      </div>
      <FlashMessage error={error} saved={saved} />

      <section className="flex flex-col gap-3 rounded-xl border p-4" aria-labelledby="contact-heading">
        <div>
          <h2 id="contact-heading" className="text-lg font-semibold">Contact & social media</h2>
          <p className="text-sm text-muted-foreground">
            Shown in the footer, on the contact page and behind the WhatsApp buttons. Leave a field empty to hide it.
          </p>
        </div>
        <form action={updateContactSettings} className="grid gap-3 sm:grid-cols-2">
          <Field id="whatsapp" name="whatsapp" label="WhatsApp number" defaultValue={contact.whatsapp} placeholder="+81 90 1234 5678" />
          <Field id="phone" name="phone" label="Phone" defaultValue={contact.phone} placeholder="+81 ..." />
          <Field id="email" name="email" label="Email" type="email" defaultValue={contact.email} placeholder="sales@..." />
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" defaultValue={contact.address} rows={2} maxLength={300} />
          </div>
          <Field id="facebook" name="facebook" label="Facebook URL" defaultValue={contact.facebook} placeholder="https://facebook.com/..." />
          <Field id="instagram" name="instagram" label="Instagram URL" defaultValue={contact.instagram} placeholder="https://instagram.com/..." />
          <Field id="youtube" name="youtube" label="YouTube URL" defaultValue={contact.youtube} placeholder="https://youtube.com/..." />
          <Field id="tiktok" name="tiktok" label="TikTok URL" defaultValue={contact.tiktok} placeholder="https://tiktok.com/@..." />
          <Field id="x" name="x" label="X (Twitter) URL" defaultValue={contact.x} placeholder="https://x.com/..." />
          <div className="sm:col-span-2">
            <Button type="submit" size="sm">Save contact details</Button>
          </div>
        </form>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border p-4" aria-labelledby="bank-heading">
        <div>
          <h2 id="bank-heading" className="text-lg font-semibold">Bank transfer details</h2>
          <p className="text-sm text-muted-foreground">
            Shown to clients on their order page when they pay. Check every character: a mistake sends money to the
            wrong account.
          </p>
        </div>
        {bankIsPlaceholder && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            These are still placeholder values. Fill in the real bank details before accepting orders.
          </p>
        )}
        <form action={updateBankDetails} className="grid gap-3 sm:grid-cols-2">
          <Field id="bankName" name="bankName" label="Bank name" defaultValue={bank.bank_name} />
          <Field id="branch" name="branch" label="Branch" defaultValue={bank.branch} />
          <Field id="accountName" name="accountName" label="Account name" defaultValue={bank.account_name} />
          <Field id="accountNo" name="accountNo" label="Account number" defaultValue={bank.account_no} />
          <Field id="swift" name="swift" label="SWIFT / BIC" defaultValue={bank.swift} />
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="note">Note for the client</Label>
            <Textarea id="note" name="note" defaultValue={bank.note} rows={2} maxLength={500} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" size="sm">Save bank details</Button>
          </div>
        </form>
      </section>
    </div>
  );
}
