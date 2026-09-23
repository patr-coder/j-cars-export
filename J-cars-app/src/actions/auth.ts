"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { passwordSchema } from "@/lib/auth/password";
import { hasFreshRecoverySession } from "@/lib/auth/recovery-session";
import { sendEmail } from "@/lib/email/resend";
import { welcomeEmail } from "@/lib/email/templates";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = { error: string | null; success?: boolean };

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: error.message };
  }

  redirect("/account");
}

const registerSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  fullName: z.string().min(1, "Full name is required."),
});

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  // handle_new_user() (migration 0005) reads raw_user_meta_data.full_name
  // to populate the auto-created profiles row.
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });
  if (error) {
    // Don't confirm which emails already have an account.
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return { error: "We couldn't create an account with that email. If you already have one, log in or reset your password." };
    }
    return { error: error.message };
  }

  await sendEmail({
    to: parsed.data.email,
    ...welcomeEmail({ name: parsed.data.fullName }),
  });

  redirect("/account");
}

const forgotPasswordSchema = z.object({ email: z.string().email() });

export async function requestPasswordReset(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password` },
  );
  if (error) {
    return { error: error.message };
  }

  return { error: null, success: true };
}

const newPasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "The two passwords don't match.", path: ["confirm"] });

// Only works with the recovery session /auth/callback set up.
export async function updatePassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Not just any signed-in session: a stolen or left-open session must not
  // be able to set a new password without the old one.
  if (!(await hasFreshRecoverySession())) {
    return { error: "This reset link has expired. Request a new one." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: error.message };
  }

  redirect("/account");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
