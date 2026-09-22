import { expect, test, type Page } from "@playwright/test";

const password = process.env.E2E_SEEDED_PASSWORD ?? "DevPassword123!";

async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/account$/);
}

test("private pages redirect an anonymous visitor to login", async ({ page }) => {
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/admin/vehicles");
  await expect(page).toHaveURL(/\/login$/);
});

test("a client can open the account but not the admin area", async ({ page }) => {
  await signIn(page, "client1@jcars.dev");
  await expect(page.getByRole("heading", { name: /Welcome/ })).toBeVisible();
  await page.goto("/admin/vehicles");
  await expect(page).toHaveURL(/\/$/);
});

test("an administrator can inspect stock management", async ({ page }) => {
  await signIn(page, "admin@jcars.dev");
  await page.goto("/admin/vehicles");
  await expect(page.getByRole("heading", { name: "Vehicles" })).toBeVisible();
  await expect(page.getByRole("link", { name: "New vehicle" })).toBeVisible();
});
