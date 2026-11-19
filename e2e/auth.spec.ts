import { expect, test } from "@playwright/test";

// WEB-04. These run without Supabase keys, so every visitor is signed out.
test.describe("auth", () => {
  test("personal pages redirect to sign-in and keep where the teacher was going", async ({
    page,
  }) => {
    await page.goto("/workspace?kind=quiz");
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fworkspace%3Fkind%3Dquiz$/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create a free account" })).toHaveAttribute(
      "href",
      "/sign-up?next=%2Fworkspace%3Fkind%3Dquiz",
    );
  });

  test("sign-in offers Google, email and password reset", async ({ page }) => {
    test.slow(); // the retry below can outlast the default 30 s under `pnpm dev`
    await page.goto("/sign-in");
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /Email/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Forgot your password?" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
    // Under `pnpm dev` the first visit compiles the route, so retry the click.
    await expect(async () => {
      if (!page.url().endsWith("/forgot-password")) {
        await page.getByRole("link", { name: "Forgot your password?" }).click();
      }
      await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible({
        timeout: 5_000,
      });
    }).toPass({ timeout: 45_000 });
  });

  test("an empty sign-in explains what is missing and moves focus to the summary", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    const submit = page.getByRole("button", { name: "Sign in", exact: true });
    await expect(submit).toBeEnabled();

    // Retry until hydrated: before that the native submit can't run validation.
    const summary = page.getByRole("alert", { name: "We couldn't sign you in" });
    await expect(async () => {
      await submit.click();
      await expect(summary).toBeFocused({ timeout: 1000 });
    }).toPass({ timeout: 30_000 });

    await summary.getByRole("link", { name: /Email:/ }).click();
    await expect(page.getByRole("textbox", { name: /Email/ })).toBeFocused();
  });

  test("sign-up fits a small phone without sideways scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto("/sign-up");
    await expect(page.getByRole("heading", { name: "Create your free account" })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
