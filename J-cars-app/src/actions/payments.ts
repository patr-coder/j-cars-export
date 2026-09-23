"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/roles";
import { getCurrentProfile } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email/resend";
import { paymentReceivedEmail, paymentRejectedEmail, paymentVerifiedEmail } from "@/lib/email/templates";
import { isFullyPaid, remainingBalance } from "@/lib/payments/rules";
import { orderFilePath, uploadOrderFile, validateOrderFile } from "@/lib/storage/order-files";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Enums = Database["public"]["Enums"];
export type PaymentProofState = { error: string | null; success?: boolean };

const STAFF_ROLES = ["admin", "sales"] as const;
const PAYABLE_STATUSES = ["reserved", "awaiting_payment"] as const;

function revalidateOrder(orderId: string) {
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account/payments");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/payments");
}

// Only same-app admin paths — returnTo comes from a form field.
function safeReturnTo(formData: FormData): string {
  const raw = String(formData.get("returnTo") ?? "");
  return /^\/admin\/[\w\-/]*$/.test(raw) ? raw : "/admin/payments";
}

function backTo(path: string, error?: string): never {
  redirect(error ? `${path}?error=${encodeURIComponent(error)}` : path);
}

export async function submitPaymentProof(
  orderId: string,
  _prevState: PaymentProofState,
  formData: FormData,
): Promise<PaymentProofState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in to submit a payment." };

  const amount = Math.round(Number(formData.get("amount")) * 100) / 100;
  const reference = String(formData.get("reference") ?? "").trim().slice(0, 100) || null;
  const file = formData.get("proof");
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Enter the amount you transferred." };
  const fileError = validateOrderFile(file);
  if (fileError) return { error: fileError };

  const supabase = await createClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, order_no, status, total_usd, user_id, payments ( amount, status )")
    .eq("id", orderId)
    .maybeSingle();
  if (orderError) return { error: orderError.message };
  if (!order || order.user_id !== profile.id) return { error: "Order not found." };
  if (!(PAYABLE_STATUSES as readonly string[]).includes(order.status)) {
    return { error: "This order is no longer accepting payments." };
  }

  const payments = order.payments.map((p) => ({ amount: Number(p.amount), status: p.status }));
  const remaining = remainingBalance(Number(order.total_usd), payments);
  if (amount > remaining) {
    return { error: `The amount exceeds the remaining balance of ${remaining.toFixed(2)} USD.` };
  }

  const proofPath = orderFilePath(orderId, "payments", file as File);
  const { error: uploadError } = await uploadOrderFile(supabase, proofPath, file as File);
  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const { error: insertError } = await supabase.from("payments").insert({
    order_id: orderId,
    amount,
    reference,
    proof_path: proofPath,
  });
  if (insertError) {
    // Clients have no delete right on order-files, so the orphaned upload
    // is left for staff; it isn't reachable without a payments row.
    return { error: insertError.message };
  }

  await sendEmail({
    to: profile.email,
    ...paymentReceivedEmail({ name: profile.full_name ?? profile.email, orderNo: order.order_no, amount }),
  });

  revalidateOrder(orderId);
  return { error: null, success: true };
}

async function loadPaymentForReview(paymentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id, order_id, amount, status, order:orders ( order_no, user:profiles ( full_name, email ) )")
    .eq("id", paymentId)
    .maybeSingle();
  if (error) throw new Error(`loadPaymentForReview: ${error.message}`);
  if (!data) return null;
  const row = data as unknown as {
    id: string;
    order_id: string;
    amount: number;
    status: string;
    order: { order_no: string; user: { full_name: string | null; email: string } | null };
  };
  return { supabase, payment: row };
}

export async function verifyPayment(paymentId: string, formData: FormData) {
  const staff = await requireRole(STAFF_ROLES);
  const returnTo = safeReturnTo(formData);
  const loaded = await loadPaymentForReview(paymentId);
  if (!loaded) backTo(returnTo, "Payment not found.");
  const { supabase, payment } = loaded;

  const { data: updated, error } = await supabase
    .from("payments")
    .update({
      status: "verified" as Enums["payment_status"],
      verified_by: staff.id,
      verified_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("id", paymentId)
    .eq("status", "pending")
    .select("id");
  if (error) backTo(returnTo, error.message);
  if (!updated || updated.length === 0) backTo(returnTo, "This payment was already reviewed.");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("status, total_usd, payments ( amount, status )")
    .eq("id", payment.order_id)
    .single();
  if (orderError) backTo(returnTo, orderError.message);

  const payments = order.payments.map((p) => ({ amount: Number(p.amount), status: p.status }));
  const total = Number(order.total_usd);
  if (isFullyPaid(total, payments)) {
    const { error: paidError } = await supabase
      .from("orders")
      .update({ status: "paid" as Enums["order_status"], reserved_until: null })
      .eq("id", payment.order_id)
      .in("status", PAYABLE_STATUSES);
    if (paidError) backTo(returnTo, paidError.message);
  }

  const client = payment.order.user;
  if (client) {
    await sendEmail({
      to: client.email,
      ...paymentVerifiedEmail({
        name: client.full_name ?? client.email,
        orderNo: payment.order.order_no,
        amount: Number(payment.amount),
        remainingUsd: remainingBalance(total, payments),
      }),
    });
  }

  revalidateOrder(payment.order_id);
  revalidatePath("/stock");
  revalidatePath("/cars/[slug]", "page");
  backTo(returnTo);
}

export async function rejectPayment(paymentId: string, formData: FormData) {
  await requireRole(STAFF_ROLES);
  const returnTo = safeReturnTo(formData);
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  if (!reason) backTo(returnTo, "A rejection reason is required.");

  const loaded = await loadPaymentForReview(paymentId);
  if (!loaded) backTo(returnTo, "Payment not found.");
  const { supabase, payment } = loaded;

  const { data: updated, error } = await supabase
    .from("payments")
    .update({ status: "rejected" as Enums["payment_status"], rejection_reason: reason })
    .eq("id", paymentId)
    .eq("status", "pending")
    .select("id");
  if (error) backTo(returnTo, error.message);
  if (!updated || updated.length === 0) backTo(returnTo, "This payment was already reviewed.");

  const client = payment.order.user;
  if (client) {
    await sendEmail({
      to: client.email,
      ...paymentRejectedEmail({
        name: client.full_name ?? client.email,
        orderNo: payment.order.order_no,
        amount: Number(payment.amount),
        reason,
      }),
    });
  }

  revalidateOrder(payment.order_id);
  backTo(returnTo);
}

