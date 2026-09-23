"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/roles";
import { ORDER_DOCUMENT_KINDS } from "@/lib/shipments/constants";
import {
  ORDER_FILES_BUCKET,
  orderFilePath,
  uploadOrderFile,
  validateOrderFile,
} from "@/lib/storage/order-files";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Enums = Database["public"]["Enums"];

const STAFF_ROLES = ["admin", "sales"] as const;

function done(orderId: string, error?: string): never {
  const back = `/admin/orders/${orderId}`;
  revalidatePath(back);
  revalidatePath(`/account/orders/${orderId}`);
  redirect(error ? `${back}?error=${encodeURIComponent(error)}` : back);
}

export async function uploadOrderDocument(orderId: string, formData: FormData) {
  const staff = await requireRole(STAFF_ROLES);
  const kind = String(formData.get("kind") ?? "");
  const kindOption = ORDER_DOCUMENT_KINDS.find((k) => k.value === kind);
  if (!kindOption) done(orderId, "Choose a document type.");
  const title = String(formData.get("title") ?? "").trim().slice(0, 120) || kindOption.label;
  const file = formData.get("file");
  const fileError = validateOrderFile(file);
  if (fileError) done(orderId, fileError);

  const supabase = await createClient();
  const path = orderFilePath(orderId, "documents", file as File);
  const { error: uploadError } = await uploadOrderFile(supabase, path, file as File);
  if (uploadError) done(orderId, `Upload failed: ${uploadError.message}`);

  const { error } = await supabase.from("order_documents").insert({
    order_id: orderId,
    kind: kind as Enums["order_document_kind"],
    title,
    storage_path: path,
    uploaded_by: staff.id,
  });
  if (error) {
    await supabase.storage.from(ORDER_FILES_BUCKET).remove([path]);
    done(orderId, error.message);
  }
  done(orderId);
}

export async function deleteOrderDocument(documentId: string, orderId: string) {
  await requireRole(STAFF_ROLES);
  const supabase = await createClient();
  const { data: doc, error: fetchError } = await supabase
    .from("order_documents")
    .select("storage_path")
    .eq("id", documentId)
    .eq("order_id", orderId)
    .maybeSingle();
  if (fetchError || !doc) done(orderId, fetchError?.message ?? "Document not found.");

  const { error: storageError } = await supabase.storage.from(ORDER_FILES_BUCKET).remove([doc.storage_path]);
  if (storageError) done(orderId, storageError.message);
  const { error } = await supabase.from("order_documents").delete().eq("id", documentId);
  if (error) done(orderId, error.message);
  done(orderId);
}
