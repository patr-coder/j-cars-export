"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { saveSearch, type SavedSearchActionState } from "@/actions/saved-searches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VehicleSearchParams } from "@/lib/catalog/filters";

const initialState: SavedSearchActionState = { error: null };

export function SaveSearchButton({
  filters,
  isSignedIn,
}: {
  filters: VehicleSearchParams;
  isSignedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(saveSearch, initialState);

  if (!isSignedIn) {
    return (
      <Button asChild variant="outline">
        <Link href="/login">Sign in to save this search</Link>
      </Button>
    );
  }

  if (state.success) {
    return <p className="text-sm text-muted-foreground">Search saved — find it in your account.</p>;
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Save this search
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="filtersJson" value={JSON.stringify(filters)} />
      <div className="flex flex-col gap-1">
        <Label htmlFor="searchName">Name</Label>
        <Input id="searchName" name="name" placeholder="e.g. SUVs under $10k" required />
      </div>
      <label className="flex items-center gap-2 pb-2 text-sm text-muted-foreground">
        <input type="checkbox" name="emailAlerts" className="size-4" />
        Email me new matches
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
