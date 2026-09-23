import { expect, test } from "@playwright/test";

// Writes one inquiry row to the local database per run.
test("a guest can send a general inquiry from the contact page", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Name").fill("E2E Guest");
  await page.getByLabel("Email").fill(`e2e+${Date.now()}@example.com`);
  await page.getByLabel("Message").fill("Do you ship to Mombasa?");
  await page.getByRole("button", { name: /send/i }).click();
  // The server action also sends (or, without RESEND_API_KEY, logs) an email.
  await expect(page.getByText(/we've received your request/i)).toBeVisible({ timeout: 15_000 });
});

test("an inquiry with an invalid email is refused", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Name").fill("E2E Guest");
  const email = page.getByLabel("Email");
  await email.fill("not-an-email");
  await page.getByRole("button", { name: /send/i }).click();
  expect(await email.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);
});
