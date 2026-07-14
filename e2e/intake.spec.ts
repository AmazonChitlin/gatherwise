import type { Page, Route } from "@playwright/test";
import { expect, expectNoHorizontalOverflow, test } from "./fixtures";

const eventDescription =
  "I want to hold a Saturday punk show in a private parking lot in Phoenix for about 300 people. There will be amplified music, merchandise vendors, a temporary stage, and no alcohol.";

const extractionResponse = {
  provider: "mock",
  model: "e2e-fixture",
  facts: [
    { key: "city", value: "phoenix", status: "extracted", evidenceText: "in Phoenix" },
    { key: "eventType", value: "music-art-event", status: "extracted", evidenceText: "punk show" },
    { key: "propertyUse", value: "parking-lot", status: "extracted", evidenceText: "private parking lot" },
    { key: "hasAmplifiedSound", value: true, status: "extracted", evidenceText: "amplified music" },
    { key: "hasAlcohol", value: false, status: "extracted", evidenceText: "no alcohol" },
    { key: "temporaryStageOrPlatform", value: true, status: "extracted", evidenceText: "temporary stage" },
  ],
  ambiguities: [],
};

test("described facts can be reviewed without defaulting unknown values", async ({ page }) => {
  await page.route("**/api/intake/extract", async (route) => {
    await route.fulfill({ json: extractionResponse });
  });

  await page.goto("/intake?path=describe");
  await page.getByLabel("Event description").fill(eventDescription);
  await page.getByRole("button", { name: "Review my description" }).click();
  await expect(page.getByRole("heading", { name: "Review extracted event facts before evaluation." })).toBeVisible();

  await openFactGroup(page, "Sound and alcohol");
  const amplifiedSound = factRow(page, "Amplified sound");
  await amplifiedSound.getByRole("button", { name: "Confirm" }).click();
  await expect(amplifiedSound.getByText("Confirmed", { exact: true })).toBeVisible();

  const alcohol = factRow(page, "Alcohol involved");
  await alcohol.getByRole("button", { name: "Confirm" }).click();
  await expect(alcohol.getByText("Confirmed", { exact: true })).toBeVisible();
  await expect(alcohol.getByText("No", { exact: true })).toBeVisible();

  await openFactGroup(page, "Place and access");
  const city = factRow(page, "City or rule area");
  await city.getByRole("button", { name: "Confirm" }).click();
  await expect(city.getByText("Confirmed", { exact: true })).toBeVisible();

  const eventType = factRow(page, "Event type");
  await eventType.getByRole("button", { name: "Edit" }).click();
  await eventType.locator("select").selectOption("community-gathering");
  await eventType.getByRole("button", { name: "Save change" }).click();
  await expect(eventType.getByText("Community gathering", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Continue with reviewed details" }).click();
  await expect(page.getByRole("heading", { name: "Build the event record in a clear planning sequence." })).toBeVisible();
  await expect(page.getByLabel("City or rule area")).toHaveValue("phoenix");
  await expect(page.getByLabel("Event type")).toHaveValue("community-gathering");
  await expect(page.getByLabel("Expected attendance")).toHaveValue("");
  await expect(page.getByLabel("Closest use case")).toHaveValue("");
  await expect(page.getByLabel("Where will setup happen?")).toHaveValue("parking-lot");
  await expectNoHorizontalOverflow(page);

  let submittedBody: Record<string, unknown> | undefined;
  await page.route("**/api/intake", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    submittedBody = route.request().postDataJSON() as Record<string, unknown>;
    await forward(route);
  });

  await page.getByRole("button", { name: "Build my readiness summary" }).click();
  await expect(page).toHaveURL(/\/results\?snapshot=/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("readiness summary");

  const review = submittedBody?.review as {
    facts: Array<{ key: string; status: string; value: unknown }>;
  };
  expect(review.facts.find((fact) => fact.key === "hasAmplifiedSound")).toMatchObject({
    status: "confirmed",
    value: true,
  });
  expect(review.facts.find((fact) => fact.key === "hasAlcohol")).toMatchObject({
    status: "confirmed",
    value: false,
  });
  expect(review.facts.find((fact) => fact.key === "expectedAttendance")).toMatchObject({
    status: "unknown",
    value: null,
  });
  expect(review.facts.find((fact) => fact.key === "useCase")).toMatchObject({
    status: "unknown",
    value: null,
  });
});

test("switching to guided aborts extraction and ignores a stale response", async ({ page }) => {
  let releaseResponse: (() => void) | undefined;
  const responseGate = new Promise<void>((resolve) => {
    releaseResponse = resolve;
  });

  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window);
    (window as Window & { __gatherwiseAbortObserved?: boolean }).__gatherwiseAbortObserved = false;
    window.fetch = (input, init) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/api/intake/extract")) {
        init?.signal?.addEventListener("abort", () => {
          (window as Window & { __gatherwiseAbortObserved?: boolean }).__gatherwiseAbortObserved = true;
        });
      }
      return originalFetch(input, init);
    };
  });

  await page.route("**/api/intake/extract", async (route) => {
    await responseGate;
    try {
      await route.fulfill({ json: extractionResponse });
    } catch {
      // The browser may close the intercepted request immediately after abort.
    }
  });

  await page.goto("/intake?path=describe");
  await page.getByLabel("Event description").fill(eventDescription);
  await page.getByRole("button", { name: "Review my description" }).click();
  await expect(page.getByRole("button", { name: "Reviewing your description..." })).toBeDisabled();

  const pathChoices = page.getByRole("group", { name: "Intake path" });
  await pathChoices.locator("button").filter({ hasText: "Use the guided form" }).click();
  await expect(page.getByRole("heading", { name: "Build the event record in a clear planning sequence." })).toBeVisible();
  await expect.poll(() =>
    page.evaluate(() =>
      Boolean((window as Window & { __gatherwiseAbortObserved?: boolean }).__gatherwiseAbortObserved),
    ),
  ).toBe(true);

  releaseResponse?.();
  await page.waitForTimeout(250);
  await expect(page.getByRole("heading", { name: "Review extracted event facts before evaluation." })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Build the event record in a clear planning sequence." })).toBeVisible();
});

test("guided validation and child toggles submit without stale aggregates", async ({ page }) => {
  await page.goto("/intake?path=guided");

  await expect(
    page.getByRole("button", { name: "Retail items or taxable goods will be sold" }),
  ).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Guests may bring their own alcohol (BYOB)" })).toBeVisible();
  await expect(page.getByText("BYOB may be allowed", { exact: false })).toHaveCount(0);

  await page.getByRole("button", { name: "Build my readiness summary" }).click();
  await expect(page.getByText("Add a short event, booth, or business name.")).toBeVisible();
  await expect(page.getByText("Choose the event date.")).toBeVisible();

  await page.getByLabel("Event, booth, or business name").fill("E2E Civic Signal Market");
  await page.getByLabel("Event date").fill("2026-12-10");

  for (const label of [
    "Food or drink samples will be offered",
    "A food truck is involved",
    "Alcohol will be sold",
    "Temporary stage or platform",
    "Street closure",
  ]) {
    const toggle = page.getByRole("button", { name: label });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
  }

  let submittedBody: Record<string, unknown> | undefined;
  await page.route("**/api/intake", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    submittedBody = route.request().postDataJSON() as Record<string, unknown>;
    await forward(route);
  });

  await page.getByRole("button", { name: "Build my readiness summary" }).click();
  await expect(page).toHaveURL(/\/results\?snapshot=/);
  expect(submittedBody).toMatchObject({
    hasFood: false,
    hasFoodTruck: false,
    foodSampling: false,
    hasAlcohol: false,
    alcoholSold: false,
    hasTemporaryStructure: false,
    temporaryStageOrPlatform: false,
    hasStreetSidewalkOrParkingImpact: false,
    streetClosure: false,
  });
});

function factRow(page: Page, label: string) {
  return page.locator("article.civic-fact-row").filter({
    has: page.getByRole("heading", { level: 4, name: label }),
  });
}

async function openFactGroup(page: Page, label: string) {
  const details = page.locator("details.civic-fact-group").filter({
    has: page.getByRole("heading", { level: 3, name: label }),
  });
  if (!(await details.getAttribute("open"))) {
    await details.locator("summary").click();
  }
}

async function forward(route: Route) {
  const response = await route.fetch();
  await route.fulfill({ response });
}
