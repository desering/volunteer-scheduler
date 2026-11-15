import { expect, test } from "@playwright/test";
import { format } from "date-fns";

test("footer shows a message about Tech Circle", async ({ page }) => {
  await page.goto("/");
  const footerText =
    "Made with❤️by volunteers at De Sering – Join the Tech Circle to help!";

  const contentInfo = page.getByRole("contentinfo");
  await expect(contentInfo).toContainText(footerText);
});

test("today's date is visible in the date select", async ({ page }) => {
  await page.goto("/");

  const today = page.getByRole("button", {
    name: `Select ${format(new Date(), "EEEE MMMM d, yyyy")}`,
  });

  await expect(today).toBeInViewport();
});
