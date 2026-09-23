import { rejectPayment, verifyPayment } from "@/actions/payments";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PaymentReviewActions({ paymentId, returnTo }: { paymentId: string; returnTo: string }) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <form action={verifyPayment.bind(null, paymentId)}>
        <input type="hidden" name="returnTo" value={returnTo} />
        <ConfirmSubmitButton type="submit" size="sm" confirmMessage="Confirm this transfer has reached the account?">
          Verify
        </ConfirmSubmitButton>
      </form>
      <form action={rejectPayment.bind(null, paymentId)} className="flex flex-1 items-end gap-2">
        <input type="hidden" name="returnTo" value={returnTo} />
        <Input name="reason" aria-label="Rejection reason" placeholder="Rejection reason" required maxLength={500} className="min-w-40 flex-1" />
        <Button type="submit" size="sm" variant="outline">
          Reject
        </Button>
      </form>
    </div>
  );
}
