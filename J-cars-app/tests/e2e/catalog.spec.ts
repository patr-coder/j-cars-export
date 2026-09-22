import { expect, test } from "@playwright/test";

test("a visitor filters stock and opens a matching vehicle", async ({ page }) => {
  await page.goto("/stock");
  await expect(page.getByRole("heading", { name: "Stock" })).toBeVisible();

  await page.getByLabel("Make", { exact: true }).selectOption("toyota");
  await page.getByRole("button", { name: "Apply filters" }).click();

  await expect(page).toHaveURL(/\/stock\?[^#]*make=toyota/);
  const cards = page.locator('a[href^="/cars/"]');
  await expect(cards.first()).toBeVisible();
  await expect(cards.first()).toContainText("Toyota");

  await cards.first().click();
  await expect(page).toHaveURL(/\/cars\//);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Toyota");
  await expect(page.getByText("Reference", { exact: true })).toBeVisible();
});

test("the estimate includes selected optional fees", async ({ page }) => {
  await page.goto("/stock?make=toyota");
  await page.locator('a[href^="/cars/"]').first().click();

  const calculator = page.locator("#quote");
  await expect(calculator.getByLabel("Destination country")).toBeVisible();
  const total = calculator.locator("dd").last();
  const before = await total.textContent();
  await calculator.getByText("Insurance", { exact: true }).click();
  await expect(total).not.toHaveText(before ?? "");
  await expect(page.locator('script[type="application/ld+json"]')).toContainText('"@type":"Vehicle"');
});

test("stock filtering works at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/stock");
  await page.getByLabel("Make", { exact: true }).selectOption("toyota");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/make=toyota/);
  await expect(page.locator('a[href^="/cars/"]').first()).toBeVisible();
});
