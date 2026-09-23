"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signIn, type AuthActionState } from "@/actions/auth";
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

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>Log in</h1>
        </CardTitle>
        <CardDescription>Access your favorites, quotes, and orders.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3">
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Logging in…" : "Log in"}
          </Button>
          <div className="flex justify-between text-sm text-muted-foreground">
            <Link href="/forgot-password" className="hover:text-foreground">
              Forgot password?
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Create account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
