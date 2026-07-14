import { expect, test as base } from "@playwright/test";
import type { Page } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    const failures: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        failures.push(`console: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => {
      failures.push(`pageerror: ${error.message}`);
    });
    page.on("response", (response) => {
      const url = new URL(response.url());
      if (
        url.origin === "http://localhost:3000" &&
        response.status() >= 400
      ) {
        failures.push(`response: ${response.status()} ${url.pathname}`);
      }
    });

    await use(page);
    expect(failures, "unexpected browser console or internal network failures").toEqual([]);
  },
});

export { expect } from "@playwright/test";

export async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
}

export async function expectNoClippedActions(page: Page) {
  const clipped = await page.locator("a:visible, button:visible, input:visible, select:visible, textarea:visible, summary:visible").evaluateAll((elements) =>
    elements
      .map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          label: element.getAttribute("aria-label") ?? element.textContent?.trim() ?? element.tagName,
          left: bounds.left,
          right: bounds.right,
        };
      })
      .filter(({ left, right }) => left < -1 || right > window.innerWidth + 1),
  );
  expect(clipped).toEqual([]);
}
