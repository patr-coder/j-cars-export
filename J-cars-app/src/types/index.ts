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
};
