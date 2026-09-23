"use client";

import Link from "next/link";
import { useActionState } from "react";

import { requestPasswordReset, type AuthActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = { error: null };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>Reset your password</h1>
        </CardTitle>
        <CardDescription>
          We&apos;ll email you a link to choose a new password.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          {state.success && (
            <p role="status" className="text-sm text-muted-foreground">
              Check your inbox for a reset link.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3">
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Sending…" : "Send reset link"}
          </Button>
          <Link href="/login" className="text-center text-sm text-muted-foreground hover:text-foreground">
            Back to log in
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
