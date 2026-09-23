"use client";

import { useActionState, useEffect, useRef } from "react";

import { submitPaymentProof, type PaymentProofState } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: PaymentProofState = { error: null };

export function PaymentProofForm({ orderId, remainingUsd }: { orderId: string; remainingUsd: number }) {
  const [state, formAction, pending] = useActionState(submitPaymentProof.bind(null, orderId), initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="amount">Amount transferred (USD)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            min="0.01"
            max={remainingUsd}
            step="0.01"
            defaultValue={remainingUsd}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="reference">Transfer reference (optional)</Label>
          <Input id="reference" name="reference" maxLength={100} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="proof">Proof of payment</Label>
        <Input
          id="proof"
          name="proof"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          aria-describedby="proof-hint"
          required
        />
        <p id="proof-hint" className="text-xs text-muted-foreground">PDF, JPG, PNG or WebP, up to 5MB.</p>
      </div>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Uploading…" : "Submit payment proof"}
      </Button>
      <p aria-live="polite" className="text-sm">
        {state.error && <span role="alert" className="text-destructive">{state.error}</span>}
        {state.success && <span className="text-success">Thanks — we&apos;ll confirm it shortly.</span>}
      </p>
    </form>
  );
}
