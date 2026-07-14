import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const routeComponent = read("components", "readiness-route.tsx");
const routeStyles = read("app", "globals.css");
const resultsPage = read("app", "results", "page.tsx");

test("readiness route uses native disclosure, live regions, and large targets", () => {
  assert.match(routeComponent, /<details/);
  assert.match(routeComponent, /<summary/);
  assert.match(routeComponent, /aria-live="polite"/);
  assert.match(routeComponent, /min-h-\[44px\]/);
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
  assert.match(routeStyles, /\.gw-readiness-route-line/);
  assert.match(routeStyles, /\.gw-readiness-route-stop/);
  assert.match(routeStyles, /prefers-reduced-motion: reduce/);
  assert.match(routeStyles, /@media \(max-width: 759px\)/);
  assert.match(routeStyles, /@media \(min-width: 1040px\)/);
});

function read(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), "utf8");
}
