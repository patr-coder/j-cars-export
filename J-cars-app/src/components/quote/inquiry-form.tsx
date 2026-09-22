"use client";

import { useActionState } from "react";

import { submitInquiry, type InquiryActionState } from "@/actions/inquiries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { flagEmoji, PHONE_COUNTRIES } from "@/lib/phone/countries";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

const initialState: InquiryActionState = { error: null };

export function InquiryForm({
  vehicleId,
  defaultName,
  defaultEmail,
}: {
  vehicleId?: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, formAction, pending] = useActionState(submitInquiry, initialState);

  if (state.success) {
    return (
      <p className="rounded-xl border bg-secondary/30 p-4 text-sm">
        Thanks — we&apos;ve received your request and will be in touch shortly.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {vehicleId && <input type="hidden" name="vehicleId" value={vehicleId} />}
      {/* Honeypot — real visitors never see this; a bot filling every field will. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={defaultName} required />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={defaultEmail} required />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <Label htmlFor="phoneNumber">Phone (optional)</Label>
          <div className="flex gap-2">
            <select
              id="phoneCountry"
              name="phoneCountry"
              defaultValue=""
              className={selectClassName + " w-24 shrink-0"}
              aria-label="Country code"
            >
              <option value="">Code</option>
              {PHONE_COUNTRIES.map((c) => (
                <option key={c.iso2} value={c.iso2} title={c.name}>
                  {flagEmoji(c.iso2)} +{c.dialCode}
                </option>
              ))}
            </select>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="123 456 789"
              className="min-w-0 flex-1"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" name="message" rows={4} placeholder="What would you like to know?" />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Sending…" : "Send request"}
      </Button>
    </form>
  );
}
