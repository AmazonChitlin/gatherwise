import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  createRateLimitHeaders,
  enforceRateLimit,
  getClientIdentifier,
  pruneRateLimitBuckets
} from "@/lib/request-guard";
import {
  findOfficialSourceById,
  findOfficialSourceIdByJurisdictionAndUrl
} from "@/lib/source-records";

const extractRoute = read("app", "api", "intake", "extract", "route.ts");
const intakeRoute = read("app", "api", "intake", "route.ts");
const simulateRoute = read("app", "api", "results", "simulate", "route.ts");
const extractionModule = read("lib", "ai", "extraction.ts");
const explanationsModule = read("lib", "ai", "explanations.ts");
const layout = read("app", "layout.tsx");
const globals = read("app", "globals.css");
const errorBoundary = read("app", "error.tsx");

test("public POST routes apply rate limiting and no-store headers", () => {
  assert.match(extractRoute, /enforceRateLimit/);
  assert.match(intakeRoute, /enforceRateLimit/);
  assert.match(simulateRoute, /enforceRateLimit/);
  assert.match(extractRoute, /createRateLimitHeaders/);
});

test("rate limiter blocks after the configured threshold", () => {
  pruneRateLimitBuckets(0);
  const rule = { limit: 2, windowMs: 10_000 };
  const first = enforceRateLimit({ key: "test-client", rule, now: 100 });
  const second = enforceRateLimit({ key: "test-client", rule, now: 101 });
  const third = enforceRateLimit({ key: "test-client", rule, now: 102 });

  assert.equal(first.allowed, true);
  assert.equal(second.allowed, true);
  assert.equal(third.allowed, false);
  assert.equal(createRateLimitHeaders(third)["Cache-Control"], "no-store");
});

test("request guard reads forwarded client identifiers safely", () => {
  const request = new Request("https://example.com", {
    headers: {
      "x-forwarded-for": "198.51.100.8, 198.51.100.9"
    }
  });

  assert.equal(getClientIdentifier(request), "198.51.100.8");
});

test("AI modules are marked server-only", () => {
  assert.match(extractionModule, /assertServerOnly\(\);/);
  assert.match(explanationsModule, /assertServerOnly\(\);/);
});

test("layout exposes a skip link and global styles protect reflow", () => {
  assert.match(layout, /Skip to main content/);
  assert.match(layout, /id=\"main-content\"/);
  assert.match(globals, /\.gw-skip-link/);
  assert.match(globals, /overflow-wrap: anywhere/);
  assert.match(globals, /overflow-x: clip/);
});

test("production error boundary avoids logging full runtime errors", () => {
  assert.match(errorBoundary, /gatherwise_render_error/);
  assert.doesNotMatch(errorBoundary, /console\.error\(error\)/);
});

test("official source lookups use validated cached records", () => {
  const source = findOfficialSourceById("phoenix-outdoor-events-private-property");
  const sourceId = findOfficialSourceIdByJurisdictionAndUrl({
    jurisdictionCode: "az-phoenix",
    sourceUrl:
      "https://www.phoenix.gov/administration/departments/pdd/tools-resources/temporary-assembly-permits/outdoor-events.html"
  });

  assert.equal(source?.jurisdictionCode, "az-phoenix");
  assert.equal(sourceId, "phoenix-outdoor-events-private-property");
  assert.equal(findOfficialSourceById("missing-id"), null);
});

function read(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), "utf8");
}
