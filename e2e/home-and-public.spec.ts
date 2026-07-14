import { getDemoGuidedHref, getDemoResultsHref, listDemoScenarios } from "../lib/demo-scenarios";
import { expect, expectNoHorizontalOverflow, test } from "./fixtures";

const featuredScenarios = listDemoScenarios().slice(0, 3);

test("homepage actions, live demo, and primary navigation work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Your event has a route",
  );
  await expectNoHorizontalOverflow(page);

  await page
    .getByRole("link", { name: "Describe my event in plain language" })
    .click();
  await expect(page).toHaveURL(/\/intake\?path=describe/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Turn the details you know",
  );

  await page.goto("/");
  await page.getByRole("link", { name: "Try a live demo" }).click();
  await expect(page).toHaveURL(/\/results\?/);
  await expect(page.getByText("Fictional demo scenario", { exact: true })).toBeVisible();

  await page.goto("/");
  const primaryNavigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  await primaryNavigation.getByRole("link", { name: "How it works" }).click();
  await expect(page).toHaveURL("/how-it-works");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Four turns",
  );
});

test("all featured one-click demos and guided samples load", async ({ page }) => {
  for (const scenario of featuredScenarios) {
    await page.goto(getDemoResultsHref(scenario));
    await expect(page.getByText(scenario.title, { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      scenario.intake.eventName,
    );

    await page.goto(getDemoGuidedHref(scenario));
    await expect(
      page.locator(".civic-intake-demo-notice").getByText(scenario.title, { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Build the event record in a clear planning sequence." })).toBeVisible();
  }
});

test("public information routes load with their distinct landmarks", async ({ page }) => {
  const routes = [
    ["/showcase", "Gatherwise turns event uncertainty into a source trail."],
    ["/how-it-works", "Four turns from event idea to official evidence."],
    ["/sources", "The evidence should be easier to inspect than the claim."],
    ["/about", "Local event planning should start with a route, not a maze."],
  ] as const;

  for (const [route, heading] of routes) {
    await page.goto(route);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});

test("known internal route matrix has no broken responses", async ({ request }) => {
  const routes = [
    "/",
    "/intake?path=describe",
    "/intake?path=guided",
    "/showcase",
    "/how-it-works",
    "/sources",
    "/about",
    "/api/health",
    ...featuredScenarios.flatMap((scenario) => [
      getDemoResultsHref(scenario),
      getDemoGuidedHref(scenario),
    ]),
  ];

  for (const route of routes) {
    const response = await request.get(route);
    expect(response.status(), route).toBeLessThan(400);
  }
});
