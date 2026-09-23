import { cache } from "react";

import { parseSetting, type BankDetails, type SettingKey, type SettingValue } from "@/lib/settings/schema";
import { createClient } from "@/lib/supabase/server";

export type { BankDetails } from "@/lib/settings/schema";

// Deduped per request: the layout (banner, footer) and the page both read
// settings on the same render.
const getAllSettings = cache(async (): Promise<Map<string, unknown>> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("key, value_json");
  if (error) throw new Error(`getSiteSettings: ${error.message}`);
  return new Map((data ?? []).map((row) => [row.key, row.value_json]));
});

export async function getSetting<K extends SettingKey>(key: K): Promise<SettingValue<K>> {
  const all = await getAllSettings();
  return parseSetting(key, all.get(key));
}

export async function getBankDetails(): Promise<BankDetails | null> {
  const bank = await getSetting("bank_details");
  return Object.values(bank).some((v) => v !== "") ? bank : null;
}

export type CmsPage = {
  slug: string;
  title: string;
  body: string;
  published: boolean;
  updatedAt: string;
};

type CmsRow = { slug: string; title: string; content_json: unknown; published: boolean; updated_at: string };

function mapCmsRow(row: CmsRow): CmsPage {
  const content = row.content_json as { body?: unknown } | null;
  return {
    slug: row.slug,
    title: row.title,
    body: typeof content?.body === "string" ? content.body : "",
    published: row.published,
    updatedAt: row.updated_at,
  };
}

// RLS returns unpublished pages to admins only, so the public pages filter
// on `published` explicitly to render the same thing for everyone.
// cache(): generateMetadata and the page both read it on the same request.
export const getPublishedCmsPage = cache(async (slug: string, locale = "en"): Promise<CmsPage | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cms_pages")
    .select("slug, title, content_json, published, updated_at")
    .eq("slug", slug)
    .eq("locale", locale)
    .eq("published", true)
    .maybeSingle();
  if (error) throw new Error(`getPublishedCmsPage: ${error.message}`);
  return data ? mapCmsRow(data) : null;
});

export async function getAdminCmsPages(locale = "en"): Promise<CmsPage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cms_pages")
    .select("slug, title, content_json, published, updated_at")
    .eq("locale", locale)
    .order("slug");
  if (error) throw new Error(`getAdminCmsPages: ${error.message}`);
  return (data ?? []).map(mapCmsRow);
}

export async function getAdminCmsPage(slug: string, locale = "en"): Promise<CmsPage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cms_pages")
    .select("slug, title, content_json, published, updated_at")
    .eq("slug", slug)
    .eq("locale", locale)
    .maybeSingle();
  if (error) throw new Error(`getAdminCmsPage: ${error.message}`);
  return data ? mapCmsRow(data) : null;
}
