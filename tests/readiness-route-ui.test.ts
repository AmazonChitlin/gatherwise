import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const routeComponent = read("components", "readiness-route.tsx");
const routeStyles = read("styles", "civic-signal.css");
const resultsPage = read("app", "results", "page.tsx");

test("readiness route uses native disclosure, live regions, and large targets", () => {
  assert.match(routeComponent, /<details/);
  assert.match(routeComponent, /<summary/);
  assert.match(routeComponent, /aria-live="polite"/);
  assert.match(
    routeStyles,
    /\.civic-simulator__control[\s\S]*min-height: 44px/,
  );
  assert.match(routeStyles, /\.civic-results-action[\s\S]*min-height: 44px/);
  assert.match(routeComponent, /Compare route change/);
});

test("readiness route includes change simulator and deterministic comparison groups", () => {
  assert.match(routeComponent, /Event Change Simulator/);
  assert.match(routeComponent, /Added requirements/);
  assert.match(routeComponent, /Removed requirements/);
  assert.match(routeComponent, /Changed warnings/);
  assert.match(routeComponent, /Newly unresolved requirements/);
});

test("results page mounts the readiness route experience", () => {
  assert.match(resultsPage, /ReadinessRouteExperience/);
  assert.match(routeComponent, /Follow the deterministic route/);
});

test("route styles include decorative line, mobile layout, and reduced-motion support", () => {
  assert.match(routeStyles, /\.civic-readiness-route__line/);
  assert.match(routeStyles, /\.civic-readiness-stop/);
  assert.match(routeStyles, /prefers-reduced-motion: reduce/);
  assert.match(routeStyles, /@media \(max-width: 768px\)/);
  assert.match(routeStyles, /@media \(max-width: 480px\)/);
});

test("simulator keeps native controls and comparison behavior available on mobile", () => {
  assert.match(routeComponent, /name="city"/);
  assert.match(routeComponent, /name="propertyUse"/);
  assert.match(routeComponent, /name="expectedAttendance"/);
  assert.match(routeComponent, /name="vendorCount"/);
  assert.match(routeComponent, /type="submit"/);
  assert.match(routeComponent, /Reset comparison/);
  assert.match(routeStyles, /\.civic-simulator__actions > \*/);
});

function read(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), "utf8");
}
