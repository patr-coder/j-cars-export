import { z } from "zod";

// Mirrors [auth] minimum_password_length / password_requirements in
// supabase/config.toml (set the same values in the hosted dashboard).
// bcrypt ignores everything past 72 bytes.
export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters.")
  .max(72, "Password must be at most 72 characters.")
  .regex(/[a-zA-Z]/, "Password must contain a letter.")
  .regex(/\d/, "Password must contain a digit.");
