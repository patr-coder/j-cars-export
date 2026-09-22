import "server-only";

import { Resend } from "resend";

import { getEnv } from "@/lib/validation/env";

type SendEmailInput = { to: string; subject: string; html: string };

const DEFAULT_FROM = "J-cars Exports <onboarding@resend.dev>";

/**
 * No-ops with a console log when RESEND_API_KEY is unset, so the rest of
 * the inquiry/quote workflow works today and email activates the moment
 * the key is added — no code change needed then (see DECISIONS.md).
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const env = getEnv();
  if (!env.RESEND_API_KEY) {
    console.log(`[email] RESEND_API_KEY not set — would send "${input.subject}" to ${input.to}`);
    return;
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL ?? DEFAULT_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
  if (error) throw new Error(`sendEmail: ${error.message}`);
}
