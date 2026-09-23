import { defineConfig, devices } from "@playwright/test";

// Local Supabase URL/anon key for the REST-level checks, same file `next dev`
// uses for local data. Absent in CI, where they come from the environment.
try {
  process.loadEnvFile(".env.development.local");
} catch {}

// Runs against `npm run dev` on localhost (not 127.0.0.1: Next only hydrates
// for allowed dev origins, see DECISIONS.md) backed by the local Supabase
// stack seeded with `npm run db:reset`.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
});
