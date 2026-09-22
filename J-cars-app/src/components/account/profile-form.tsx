"use client";

import { useActionState } from "react";

import { updateProfile, type ProfileActionState } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/types";

const selectClassName =
  "h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

const initialState: ProfileActionState = { error: null };

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="mt-6 flex max-w-xl flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" defaultValue={profile.full_name ?? ""} required />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Email</Label>
          <Input value={profile.email} disabled />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" name="whatsapp" defaultValue={profile.whatsapp ?? ""} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="preferredLanguage">Preferred language</Label>
          <select
            id="preferredLanguage"
            name="preferredLanguage"
            defaultValue={profile.preferred_language}
            className={selectClassName}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ja">日本語</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="preferredCurrency">Preferred currency</Label>
          <select
            id="preferredCurrency"
            name="preferredCurrency"
            defaultValue={profile.preferred_currency}
            className={selectClassName}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="JPY">JPY</option>
          </select>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Consignee</h2>
        <p className="text-sm text-muted-foreground">
          Who the vehicle should ship to, if different from you. Leave blank to consign to yourself.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="consigneeName">Name</Label>
            <Input id="consigneeName" name="consigneeName" defaultValue={profile.consignee_name ?? ""} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="consigneeCompany">Company</Label>
            <Input
              id="consigneeCompany"
              name="consigneeCompany"
              defaultValue={profile.consignee_company ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="consigneeAddress">Address</Label>
            <Input
              id="consigneeAddress"
              name="consigneeAddress"
              defaultValue={profile.consignee_address ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="consigneeCity">City</Label>
            <Input id="consigneeCity" name="consigneeCity" defaultValue={profile.consignee_city ?? ""} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="consigneeCountry">Country</Label>
            <Input
              id="consigneeCountry"
              name="consigneeCountry"
              defaultValue={profile.consignee_country ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="consigneePhone">Phone</Label>
            <Input id="consigneePhone" name="consigneePhone" defaultValue={profile.consignee_phone ?? ""} />
          </div>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && <p className="text-sm text-muted-foreground">Saved.</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
