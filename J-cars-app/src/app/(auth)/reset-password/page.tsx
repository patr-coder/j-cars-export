import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { hasFreshRecoverySession } from "@/lib/auth/recovery-session";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default async function ResetPasswordPage() {
  // /auth/callback signs the user in from the emailed link before sending
  // them here; updatePassword re-checks the same thing.
  if (!(await hasFreshRecoverySession())) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
          <h1>This link has expired</h1>
        </CardTitle>
          <CardDescription>Password reset links work once and expire after a while. Request a new one.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Send a new link</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }
  return <ResetPasswordForm />;
}
