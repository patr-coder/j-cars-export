"use client";

import Link from "next/link";
import { useActionState } from "react";

import { reserveVehicle, type ReserveActionState } from "@/actions/orders";
import { Button } from "@/components/ui/button";

const initialState: ReserveActionState = { error: null };

export function ReserveButton({
  vehicleId,
  isSignedIn,
  isAvailable,
}: {
  vehicleId: string;
  isSignedIn: boolean;
  isAvailable: boolean;
}) {
  const [state, formAction, pending] = useActionState(reserveVehicle.bind(null, vehicleId), initialState);

  if (!isSignedIn) {
    return (
      <Button asChild variant="outline">
        <Link href="/login">Sign in to reserve</Link>
      </Button>
    );
  }

  if (state.success) {
    return (
      <Button variant="outline" disabled>
        Reserved — check your account
      </Button>
    );
  }

  if (!isAvailable) {
    return (
      <Button variant="outline" disabled title="This vehicle is no longer available">
        Reserve Vehicle
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Reserving…" : "Reserve Vehicle"}
      </Button>
      {state.error && (
        <p role="alert" className="text-xs text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
