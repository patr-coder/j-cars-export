export type Role = "admin" | "sales" | "inventory_manager" | "client";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  country_code: string | null;
  preferred_language: string;
  preferred_currency: string;
  role: Role;
  created_at: string;
  consignee_name: string | null;
  consignee_company: string | null;
  consignee_address: string | null;
  consignee_city: string | null;
  consignee_country: string | null;
  consignee_phone: string | null;
};
