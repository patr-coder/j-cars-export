import type { Role } from "@/types";

export const ROLES: readonly Role[] = ["client", "sales", "inventory_manager", "admin"];

export const ROLE_LABELS: Record<Role, string> = {
  client: "Client",
  sales: "Sales",
  inventory_manager: "Inventory manager",
  admin: "Admin",
};
