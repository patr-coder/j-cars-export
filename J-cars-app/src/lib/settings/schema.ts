import { z } from "zod";

// Rendered as <a href>, so only site-relative paths or https URLs. Browsers
// treat a backslash like "/" and silently drop tabs/newlines, so "/\host" or
// "/<tab>/host" would become the protocol-relative "//host" and leave the
// site: no backslash or whitespace anywhere, and no second slash up front.
const SITE_PATH_RE = /^\/(?!\/)[^\s\\]*$/;
const HTTPS_URL_RE = /^https:\/\/[^\s\\]+$/;

const linkSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || SITE_PATH_RE.test(v) || HTTPS_URL_RE.test(v), {
    message: "Use a path starting with / or an https:// URL.",
  });

const httpsUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || HTTPS_URL_RE.test(v), { message: "Use an https:// URL." });

export const ALERT_TONES = ["info", "warning", "success"] as const;

export const alertBannerSchema = z
  .object({
    enabled: z.boolean(),
    message: z.string().trim().max(300),
    tone: z.enum(ALERT_TONES),
    link_url: linkSchema,
    link_label: z.string().trim().max(60),
  })
  .refine((v) => !v.enabled || v.message.length > 0, {
    message: "A message is required to show the banner.",
    path: ["message"],
  });

export const heroSchema = z.object({
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(300),
  cta_label: z.string().trim().max(40),
  cta_url: linkSchema,
});

export const contactSchema = z.object({
  whatsapp: z.string().trim().max(30),
  phone: z.string().trim().max(30),
  email: z.union([z.literal(""), z.email().max(200)]),
  address: z.string().trim().max(300),
  facebook: httpsUrlSchema,
  instagram: httpsUrlSchema,
  youtube: httpsUrlSchema,
  tiktok: httpsUrlSchema,
  x: httpsUrlSchema,
});

export const bankDetailsSchema = z.object({
  bank_name: z.string().trim().max(120),
  account_name: z.string().trim().max(120),
  account_no: z.string().trim().max(60),
  swift: z.string().trim().max(20),
  branch: z.string().trim().max(120),
  note: z.string().trim().max(500),
});

export const faqItemSchema = z.object({
  id: z.string().min(1),
  question: z.string().trim().min(1).max(200),
  answer: z.string().trim().min(1).max(2000),
});

export const testimonialItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  country: z.string().trim().max(80),
  quote: z.string().trim().min(1).max(600),
});

const faqSchema = z.object({ items: z.array(faqItemSchema) });
const testimonialsSchema = z.object({ items: z.array(testimonialItemSchema) });

export const SETTING_SCHEMAS = {
  alert_banner: alertBannerSchema,
  hero: heroSchema,
  contact: contactSchema,
  bank_details: bankDetailsSchema,
  faq: faqSchema,
  testimonials: testimonialsSchema,
} as const;

export type SettingKey = keyof typeof SETTING_SCHEMAS;
export type SettingValue<K extends SettingKey> = z.infer<(typeof SETTING_SCHEMAS)[K]>;

export type AlertBanner = SettingValue<"alert_banner">;
export type Hero = SettingValue<"hero">;
export type ContactSettings = SettingValue<"contact">;
export type BankDetails = SettingValue<"bank_details">;
export type FaqItem = z.infer<typeof faqItemSchema>;
export type TestimonialItem = z.infer<typeof testimonialItemSchema>;

export const DEFAULT_SETTINGS: { [K in SettingKey]: SettingValue<K> } = {
  alert_banner: { enabled: false, message: "", tone: "info", link_url: "", link_label: "" },
  hero: {
    title: "Quality used vehicles, exported worldwide.",
    subtitle: "Browse our stock, get a landed-cost estimate, and track your vehicle from Japan to your port.",
    cta_label: "Browse stock",
    cta_url: "/stock",
  },
  contact: {
    whatsapp: "",
    phone: "",
    email: "",
    address: "",
    facebook: "",
    instagram: "",
    youtube: "",
    tiktok: "",
    x: "",
  },
  bank_details: { bank_name: "", account_name: "", account_no: "", swift: "", branch: "", note: "" },
  faq: { items: [] },
  testimonials: { items: [] },
};

// A missing or malformed row never breaks a public page: missing fields come
// from the defaults, and anything invalid falls back to the defaults.
export function parseSetting<K extends SettingKey>(key: K, raw: unknown): SettingValue<K> {
  const defaults = DEFAULT_SETTINGS[key];
  const merged =
    raw && typeof raw === "object" && !Array.isArray(raw) ? { ...defaults, ...(raw as object) } : defaults;
  const parsed = SETTING_SCHEMAS[key].safeParse(merged);
  return (parsed.success ? parsed.data : defaults) as SettingValue<K>;
}
