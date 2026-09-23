import { expect, test } from "@playwright/test";

const PROTECTED = [
  "/account",
  "/account/orders",
  "/admin",
  "/admin/content",
  "/admin/settings",
  "/admin/audit",
  "/admin/customers",
  "/admin/payments",
];

test.describe("signed-out visitors", () => {
  for (const path of PROTECTED) {
    test(`are sent to login from ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login$/);
    });
  }

  test("can't read the audit log or dashboard over the REST API", async ({ request }) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:56321";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    test.skip(!key, "NEXT_PUBLIC_SUPABASE_ANON_KEY not set");

    const headers = { apikey: key!, Authorization: `Bearer ${key}` };
    const audit = await request.get(`${url}/rest/v1/audit_logs?select=id&limit=1`, { headers });
    expect(await audit.json()).toEqual([]);

    const metrics = await request.post(`${url}/rest/v1/rpc/dashboard_metrics`, { headers, data: {} });
    expect(metrics.ok()).toBe(false);
  });
});

test.describe("password reset", () => {
  test("a missing or bad recovery code lands on the request-a-new-link page", async ({ page }) => {
    await page.goto("/auth/callback?code=not-a-real-code&next=//evil.example");
    await expect(page).toHaveURL(/\/forgot-password\?error=link$/);
    await expect(page.getByRole("alert")).toContainText("invalid or has expired");
  });

  test("the reset page asks for a new link without a recovery session", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByText("This link has expired")).toBeVisible();
    await expect(page.getByRole("link", { name: "Send a new link" })).toHaveAttribute("href", "/forgot-password");
  });
});
