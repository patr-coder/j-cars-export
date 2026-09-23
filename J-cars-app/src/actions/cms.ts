"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth/roles";
import { getSetting } from "@/lib/settings/queries";
import {
  alertBannerSchema,
  bankDetailsSchema,
  contactSchema,
  faqItemSchema,
  heroSchema,
  SETTING_SCHEMAS,
  testimonialItemSchema,
  type SettingKey,
  type SettingValue,
} from "@/lib/settings/schema";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

// site_settings / cms_pages RLS (migration 0006) grants write to 'admin' only.
const ADMIN_ONLY = ["admin"] as const;

function back(path: string, result: { error?: string; saved?: string }): never {
  const params = new URLSearchParams();
  if (result.error) params.set("error", result.error);
  if (result.saved) params.set("saved", result.saved);
  redirect(`${path}?${params.toString()}`);
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  const field = issue?.path.join(".");
  return field ? `${field}: ${issue.message}` : (issue?.message ?? "Invalid input.");
}

async function saveSetting<K extends SettingKey>(key: K, value: SettingValue<K>, path: string) {
  const parsed = SETTING_SCHEMAS[key].safeParse(value);
  if (!parsed.success) back(path, { error: firstIssue(parsed.error) });

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value_json: parsed.data as unknown as Json });
  if (error) back(path, { error: `Could not save: ${error.message}` });

  // Banner, hero, contact details and FAQ render in the public layout/home.
  revalidatePath("/", "layout");
}

export async function updateAlertBanner(formData: FormData) {
  await requireRole(ADMIN_ONLY);
  const value = {
    enabled: formData.get("enabled") === "on",
    message: text(formData, "message"),
    tone: text(formData, "tone") as SettingValue<"alert_banner">["tone"],
    link_url: text(formData, "linkUrl"),
    link_label: text(formData, "linkLabel"),
  };
  const parsed = alertBannerSchema.safeParse(value);
  if (!parsed.success) back("/admin/content", { error: firstIssue(parsed.error) });
  await saveSetting("alert_banner", parsed.data, "/admin/content");
  back("/admin/content", { saved: "Alert banner saved." });
}

export async function updateHero(formData: FormData) {
  await requireRole(ADMIN_ONLY);
  const parsed = heroSchema.safeParse({
    title: text(formData, "title"),
    subtitle: text(formData, "subtitle"),
    cta_label: text(formData, "ctaLabel"),
    cta_url: text(formData, "ctaUrl"),
  });
  if (!parsed.success) back("/admin/content", { error: firstIssue(parsed.error) });
  await saveSetting("hero", parsed.data, "/admin/content");
  back("/admin/content", { saved: "Home hero saved." });
}

export async function addFaqItem(formData: FormData) {
  await requireRole(ADMIN_ONLY);
  const parsed = faqItemSchema.safeParse({
    id: randomUUID(),
    question: text(formData, "question"),
    answer: text(formData, "answer"),
  });
  if (!parsed.success) back("/admin/content", { error: firstIssue(parsed.error) });
  const faq = await getSetting("faq");
  await saveSetting("faq", { items: [...faq.items, parsed.data] }, "/admin/content");
  back("/admin/content", { saved: "FAQ item added." });
}

export async function deleteFaqItem(id: string) {
  await requireRole(ADMIN_ONLY);
  const faq = await getSetting("faq");
  await saveSetting("faq", { items: faq.items.filter((item) => item.id !== id) }, "/admin/content");
  back("/admin/content", { saved: "FAQ item deleted." });
}

export async function moveFaqItem(id: string, direction: -1 | 1) {
  await requireRole(ADMIN_ONLY);
  const faq = await getSetting("faq");
  const items = [...faq.items];
  const from = items.findIndex((item) => item.id === id);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= items.length) back("/admin/content", {});
  [items[from], items[to]] = [items[to], items[from]];
  await saveSetting("faq", { items }, "/admin/content");
  back("/admin/content", {});
}

export async function addTestimonial(formData: FormData) {
  await requireRole(ADMIN_ONLY);
  const parsed = testimonialItemSchema.safeParse({
    id: randomUUID(),
    name: text(formData, "name"),
    country: text(formData, "country"),
    quote: text(formData, "quote"),
  });
  if (!parsed.success) back("/admin/content", { error: firstIssue(parsed.error) });
  const testimonials = await getSetting("testimonials");
  await saveSetting("testimonials", { items: [...testimonials.items, parsed.data] }, "/admin/content");
  back("/admin/content", { saved: "Testimonial added." });
}

export async function deleteTestimonial(id: string) {
  await requireRole(ADMIN_ONLY);
  const testimonials = await getSetting("testimonials");
  await saveSetting(
    "testimonials",
    { items: testimonials.items.filter((item) => item.id !== id) },
    "/admin/content",
  );
  back("/admin/content", { saved: "Testimonial deleted." });
}

export async function updateContactSettings(formData: FormData) {
  await requireRole(ADMIN_ONLY);
  const parsed = contactSchema.safeParse({
    whatsapp: text(formData, "whatsapp"),
    phone: text(formData, "phone"),
    email: text(formData, "email"),
    address: text(formData, "address"),
    facebook: text(formData, "facebook"),
    instagram: text(formData, "instagram"),
    youtube: text(formData, "youtube"),
    tiktok: text(formData, "tiktok"),
    x: text(formData, "x"),
  });
  if (!parsed.success) back("/admin/settings", { error: firstIssue(parsed.error) });
  await saveSetting("contact", parsed.data, "/admin/settings");
  back("/admin/settings", { saved: "Contact details saved." });
}

export async function updateBankDetails(formData: FormData) {
  await requireRole(ADMIN_ONLY);
  const parsed = bankDetailsSchema.safeParse({
    bank_name: text(formData, "bankName"),
    account_name: text(formData, "accountName"),
    account_no: text(formData, "accountNo"),
    swift: text(formData, "swift"),
    branch: text(formData, "branch"),
    note: text(formData, "note"),
  });
  if (!parsed.success) back("/admin/settings", { error: firstIssue(parsed.error) });
  await saveSetting("bank_details", parsed.data, "/admin/settings");
  back("/admin/settings", { saved: "Bank details saved." });
}

const cmsPageSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().max(20000),
  published: z.boolean(),
});

const CMS_PAGE_PATHS: Record<string, string> = {
  about: "/about",
  "how-to-buy": "/how-to-buy",
  shipping: "/shipping",
  contact: "/contact",
};

export async function updateCmsPage(slug: string, formData: FormData) {
  await requireRole(ADMIN_ONLY);
  const path = `/admin/content/pages/${encodeURIComponent(slug)}`;
  const parsed = cmsPageSchema.safeParse({
    title: text(formData, "title"),
    body: String(formData.get("body") ?? ""),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) back(path, { error: firstIssue(parsed.error) });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cms_pages")
    .update({
      title: parsed.data.title,
      content_json: { body: parsed.data.body },
      published: parsed.data.published,
    })
    .eq("slug", slug)
    .eq("locale", "en")
    .select("id");
  if (error) back(path, { error: `Could not save: ${error.message}` });
  if (!data?.length) back(path, { error: "Page not found." });

  const publicPath = CMS_PAGE_PATHS[slug];
  if (publicPath) revalidatePath(publicPath);
  back(path, { saved: "Page saved." });
}
