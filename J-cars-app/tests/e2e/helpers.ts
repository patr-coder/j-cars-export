import { expect, type Page } from "@playwright/test";

export async function firstVehicleHref(page: Page): Promise<string> {
  await page.goto("/stock");
  const href = await page.locator('main a[href^="/cars/"]').first().getAttribute("href");
  expect(href).toBeTruthy();
  return href!;
}

// Staff/client flows need real sign-in. Credentials come from the
// environment only (for local runs, the dev-only seeded accounts listed in
// PROGRESS.md), so nothing secret is committed and the specs skip cleanly
// when they aren't provided.
export function credentials(role: "ADMIN" | "CLIENT"): { email: string; password: string } | null {
  const email = process.env[`E2E_${role}_EMAIL`];
  const password = process.env[`E2E_${role}_PASSWORD`];
  return email && password ? { email, password } : null;
}

export async function signIn(page: Page, creds: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(creds.email);
  await page.getByLabel("Password").fill(creds.password);
  await page.getByRole("button", { name: /log in|sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}
