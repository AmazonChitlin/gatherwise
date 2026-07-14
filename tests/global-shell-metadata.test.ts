import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveSiteUrl } from "@/lib/site-url";

const header = read("components", "site-header.tsx");
const footer = read("components", "site-footer.tsx");
const layout = read("app", "layout.tsx");
const home = read("app", "page.tsx");
const styles = read("styles", "civic-signal.css");

test("header exposes one intake CTA and four text destinations", () => {
  assert.equal(matches(header, /Start a route/g), 1);
  assert.equal(matches(header, /href="\/intake\?path=describe"/g), 1);
  assert.doesNotMatch(header, /Plan an event/);
  for (const label of ["How it works", "Sources", "About", "Showcase"]) {
    assert.match(header, new RegExp(label));
  }
});

test("mobile navigation is an accessible focus-managed disclosure", () => {
  assert.match(header, /aria-expanded=\{menuOpen\}/);
  assert.match(header, /aria-controls="civic-primary-navigation"/);
  assert.match(header, /event\.key !== "Escape"/);
  assert.match(header, /firstLinkRef\.current\?\.focus\(\)/);
  assert.match(header, /menuButtonRef\.current\?\.focus\(\)/);
  assert.match(styles, /\.civic-nav\[data-open="true"\]/);
  assert.match(styles, /min-height: 64px/);
});

test("site URL parsing accepts the production origin and normalizes paths", () => {
  assert.equal(
    resolveSiteUrl("https://gatherwise-production.up.railway.app/path?q=1").href,
    "https://gatherwise-production.up.railway.app/",
  );
  assert.match(layout, /metadataBase: getSiteUrl\(\)/);
  assert.match(layout, /url: "\/"/);
  assert.match(layout, /card: "summary"/);
  assert.doesNotMatch(layout, /gatherwise\.local|images:/);
});

test("site URL parsing falls back safely in development", () => {
  assert.equal(resolveSiteUrl().href, "http://localhost:3000/");
  assert.equal(resolveSiteUrl("not a url").href, "http://localhost:3000/");
  assert.equal(resolveSiteUrl("javascript:alert(1)").href, "http://localhost:3000/");
  assert.equal(
    resolveSiteUrl("https://user:password@example.com").href,
    "http://localhost:3000/",
  );
});

test("homepage mockup keeps extracted and unknown facts honest", () => {
  assert.equal(matches(home, /status="Needs review"/g), 3);
  assert.match(home, /status="Unknown" unknown/);
  assert.doesNotMatch(home, /status="Confirmed"/);
  assert.match(home, /1,284 \/ 4,000 characters/);
  assert.doesNotMatch(home, /2,500 characters|legal approval/i);
});

test("footer support text has readable sizing and contrast", () => {
  assert.match(footer, /civic-footer__wordmark" aria-hidden="true"/);
  assert.match(footer, /Informational guidance only/);
  assert.match(styles, /civic-footer__scope span[^\n]*rgba\(255, 253, 247, 0\.78\)[^\n]*0\.8125rem/);
  assert.match(styles, /civic-footer__legal[\s\S]*rgba\(255, 253, 247, 0\.76\)[\s\S]*font-size: 0\.8125rem/);
});

test("global shell retains visible focus and reduced-motion protections", () => {
  assert.match(styles, /\.civic-nav-toggle/);
  assert.match(styles, /min-height: 44px/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(layout, /gw-skip-link/);
  assert.match(layout, /Skip to main content/);
});

function matches(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

function read(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), "utf8");
}
