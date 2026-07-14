import { getDemoResultsHref, getDemoScenario } from "../lib/demo-scenarios";
import {
  expect,
  expectNoClippedActions,
  expectNoHorizontalOverflow,
  test,
} from "./fixtures";

const supportedDemo = getDemoScenario("private-property-punk-show")!;
const unsupportedDemo = getDemoScenario("unsupported-jurisdiction")!;

test("supported results expose route, evidence, sources, simulator, and boundary", async ({ page }) => {
  await page.goto(getDemoResultsHref(supportedDemo));

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Warehouse Sparks Fest readiness summary",
  );
  await expect(page.getByRole("heading", { name: "Follow the deterministic route" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What may apply" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What could change the result" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your fact. Verified rule. Official source." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Official sources" })).toBeVisible();
  await expect(page.getByText("Informational guidance only.", { exact: false })).toBeVisible();

  const evidenceDetails = page.locator("details.civic-evidence-trail");
  expect(await evidenceDetails.count()).toBeGreaterThan(0);
  await evidenceDetails.first().locator("summary").click();
  await expect(evidenceDetails.first().getByText("Your fact", { exact: true })).toBeVisible();
  await expect(evidenceDetails.first().getByText("Verified rule", { exact: true })).toBeVisible();
  await expect(evidenceDetails.first().getByText("Official source", { exact: true })).toBeVisible();

  const sourceLinks = page.getByRole("link", { name: "Check the official source" });
  expect(await sourceLinks.count()).toBeGreaterThan(0);
  await expect(sourceLinks.first()).toHaveAttribute("href", /^https:\/\//);

  await page.getByLabel("City").selectOption("tempe");
  await page.getByRole("button", { name: "Compare route change" }).click();
  await expect(page.getByRole("heading", { name: "Deterministic route difference" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Added requirements" })).toBeVisible();
});

test("unsupported geography stops before fabricated guidance", async ({ page }) => {
  await page.goto(getDemoResultsHref(unsupportedDemo));
  await expect(page.getByText("Unsupported", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "This readiness route stops",
  );
  await expect(page.getByText("Not evaluated", { exact: true })).toBeVisible();
  await expect(page.getByText("Not selected", { exact: true })).toBeVisible();
  await expect(page.getByText("Supported pilot result", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "What may apply" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Check the official source" })).toHaveCount(0);
});

const viewports = [
  { width: 320, height: 800, mobile: true },
  { width: 375, height: 812, mobile: true },
  { width: 768, height: 1024, mobile: true },
  { width: 1024, height: 768, mobile: false },
  { width: 1440, height: 1000, mobile: false },
] as const;

for (const viewport of viewports) {
  test(`${viewport.width}x${viewport.height} shell and workspaces do not overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const routes = [
      "/",
      "/intake?path=guided",
      getDemoResultsHref(supportedDemo),
      "/sources",
    ];

    for (const route of routes) {
      await page.goto(route);
      await expect(page.getByRole("main")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await expectNoClippedActions(page);
    }

    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Open navigation" });
    if (viewport.mobile) {
      await expect(menuButton).toBeVisible();
      const closedHeader = await page.locator("header.civic-header").boundingBox();
      expect(closedHeader?.height).toBeLessThanOrEqual(65);
      await menuButton.click();
      await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Start a Gatherwise readiness route" })).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await page.keyboard.press("Escape");
      await expect(menuButton).toBeFocused();
      await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeHidden();
    } else {
      await expect(menuButton).toBeHidden();
      await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    }
  });
}

test("keyboard focus reaches global, intake, result, source, and footer controls", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Gatherwise home" })).toBeFocused();
  await page.keyboard.press("Tab");
  const menuButton = page.getByRole("button", { name: "Open navigation" });
  await expect(menuButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: "How it works" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menuButton).toBeFocused();

  await page.goto("/intake?path=describe");
  for (const locator of [
    page.getByRole("group", { name: "Intake path" }).locator("button").first(),
    page.getByLabel("Event description"),
    page.getByRole("button", { name: "Review my description" }),
  ]) {
    await locator.focus();
    await expect(locator).toBeFocused();
  }

  await page.goto(getDemoResultsHref(supportedDemo));
  const routeSummary = page.locator("details.civic-readiness-stop summary").first();
  await routeSummary.focus();
  await expect(routeSummary).toBeFocused();
  const simulator = page.getByRole("button", { name: "Compare route change" });
  await simulator.focus();
  await expect(simulator).toBeFocused();
  const sourceLink = page.getByRole("link", { name: "Check the official source" }).first();
  await sourceLink.focus();
  await expect(sourceLink).toBeFocused();
  const footerLink = page.getByRole("navigation", { name: "Footer navigation" }).getByRole("link", { name: "About" });
  await footerLink.focus();
  await expect(footerLink).toBeFocused();
});
