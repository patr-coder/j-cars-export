"use client";

import { useActionState } from "react";

import type { QuoteActionState } from "@/actions/quotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { QuoteDetail } from "@/lib/quotes/queries";

const initialState: QuoteActionState = { error: null };

const FIELDS: { name: keyof Pick<QuoteDetail, "vehiclePrice" | "freight" | "insurance" | "inspection" | "certificate" | "otherFees" | "discount">; label: string }[] = [
  { name: "vehiclePrice", label: "Vehicle price (USD)" },
  { name: "freight", label: "Freight (USD)" },
  { name: "insurance", label: "Insurance (USD)" },
  { name: "inspection", label: "Inspection (USD)" },
  { name: "certificate", label: "Certificate (USD)" },
  { name: "otherFees", label: "Other fees (USD)" },
  { name: "discount", label: "Discount (USD)" },
];

export function QuoteEditForm({
  quote,
  action,
}: {
  quote: QuoteDetail;
  action: (prevState: QuoteActionState, formData: FormData) => Promise<QuoteActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FIELDS.map((f) => (
          <div key={f.name} className="flex flex-col gap-1">
            <Label htmlFor={f.name}>{f.label}</Label>
            <Input id={f.name} name={f.name} type="number" step="0.01" defaultValue={quote[f.name]} />
          </div>
        ))}
        <div className="flex flex-col gap-1">
          <Label htmlFor="expiresAt">Expires</Label>
          <Input
            id="expiresAt"
            name="expiresAt"
            type="date"
            defaultValue={quote.expiresAt ? quote.expiresAt.slice(0, 10) : ""}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">Current total: ${quote.totalUsd.toLocaleString()}</p>

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
