import { expect, test } from "@playwright/test";

import { credentials, signIn } from "./helpers";

const admin = credentials("ADMIN");

// Needs E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD. Serial: the banner test
// changes a shared setting and puts it back.
test.describe.configure({ mode: "serial" });
test.describe("admin", () => {
  test.skip(!admin, "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await signIn(page, admin!);
  });

  test("dashboard shows stock and sales KPIs", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Stock" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sales" })).toBeVisible();
    await expect(page.getByText("Revenue (verified)")).toBeVisible();
  });

  test("an alert banner saved in the CMS shows on the public site and is audited", async ({ page }) => {
    const message = `E2E notice ${Date.now()}`;
    await page.goto("/admin/content");
    await page.getByLabel("Show the banner").check();
    await page.getByLabel("Message").first().fill(message);
    await page.getByRole("button", { name: "Save banner" }).click();
    await expect(page.getByText("Alert banner saved.")).toBeVisible();

    await page.goto("/");
    await expect(page.getByRole("region", { name: "Announcement" })).toContainText(message);

    await page.goto("/admin/audit?entity=site_settings");
    await expect(page.locator("summary").first()).toContainText("updated site settings");

    await page.goto("/admin/content");
    await page.getByLabel("Show the banner").uncheck();
    await page.getByLabel("Message").first().fill("");
    await page.getByRole("button", { name: "Save banner" }).click();
    await expect(page.getByText("Alert banner saved.")).toBeVisible();
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Announcement" })).toHaveCount(0);
  });

  test("an unsafe link is refused", async ({ page }) => {
    await page.goto("/admin/content");
    await page.getByLabel("Button link").fill("/\\evil.example");
    await page.getByRole("button", { name: "Save hero" }).click();
    await expect(page.getByRole("alert")).toContainText("Use a path starting with /");
  });

  test("the admin nav is reachable on a phone @mobile", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("navigation", { name: "Admin" }).getByRole("link", { name: "Audit log" })).toBeVisible();
  });
});
