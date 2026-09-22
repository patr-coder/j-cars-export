import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("a guest inquiry appears in the admin inbox", async ({ page }) => {
  const email = `e2e-${randomUUID()}@example.test`;

  await page.goto("/contact");
  await page.getByLabel("Name").fill("Playwright Visitor");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Message").fill("Please send a shipping quote.");
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByText("Thanks — we've received your request")).toBeVisible();

  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@jcars.dev");
  await page.getByLabel("Password").fill(process.env.E2E_SEEDED_PASSWORD ?? "DevPassword123!");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/account$/);
  await page.goto("/admin/inquiries");
  await expect(page.getByRole("row").filter({ hasText: email })).toBeVisible();
});
