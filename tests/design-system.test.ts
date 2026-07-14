import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const globalsCss = readFileSync(
  join(process.cwd(), "app", "globals.css"),
  "utf8"
);
const layout = readFileSync(join(process.cwd(), "app", "layout.tsx"), "utf8");
const home = readFileSync(join(process.cwd(), "app", "page.tsx"), "utf8");

test("defines Gatherwise semantic color tokens and OKLCH support layer", () => {
  const requiredTokens = [
    "--gw-canvas",
    "--gw-surface",
    "--gw-surface-elevated",
    "--gw-text",
    "--gw-text-muted",
    "--gw-border",
    "--gw-action-primary",
    "--gw-action-secondary",
    "--gw-focus",
    "--gw-information",
    "--gw-caution",
    "--gw-critical",
    "--gw-success",
    "--gw-unknown",
    "--gw-ai-extracted",
    "--gw-verified-rule",
    "--gw-official-source"
  ];

  for (const token of requiredTokens) {
    assert.match(globalsCss, new RegExp(`${escapeToken(token)}\\s*:`));
  }

  assert.match(globalsCss, /@supports\s*\(color:\s*oklch\(0\.5 0\.1 0\)\)/);
});

test("defines typography, spacing, layout, and motion foundations", () => {
  const expected = [
    "--font-sans",
    "--font-display",
    "--text-step-0",
    "--text-step-5",
    "--measure-reading",
    "--space-1",
    "--space-9",
    "--section-space",
    "--content-width",
    "--grid-gutter",
    "--radius-lg",
    "--shadow-3",
    "--motion-micro",
    "--motion-standard",
    "--motion-route",
    "--ease-standard"
  ];

  for (const token of expected) {
    assert.match(globalsCss, new RegExp(`${escapeToken(token)}\\s*:`));
  }
});

test("defines semantic state helpers for unsupported and AI-unavailable states", () => {
  const classes = [
    ".gw-status-token-ai",
    ".gw-status-token-verified",
    ".gw-source-token-official",
    ".gw-requirement-card",
    ".gw-inline-error",
    ".gw-unsupported-jurisdiction",
    ".gw-ai-unavailable"
  ];

  for (const className of classes) {
    assert.match(globalsCss, new RegExp(escapeToken(className)));
  }
});

test("loads the Civic Signal type system through next font", () => {
  assert.match(layout, /Manrope, Newsreader/);
  assert.match(layout, /--font-manrope/);
  assert.match(layout, /--font-newsreader/);
  assert.match(globalsCss, /font-family:\s*var\(--font-manrope\)/);
  assert.match(globalsCss, /font-family:\s*var\(--font-newsreader\)/);
});

test("defines the Civic Signal palette, route motion, and reduced-motion fallback", () => {
  const tokens = [
    "--civic-ink",
    "--civic-limestone",
    "--civic-paper",
    "--civic-orange",
    "--civic-cactus",
    "--civic-slate"
  ];

  for (const token of tokens) {
    assert.match(globalsCss, new RegExp(`${escapeToken(token)}\\s*:`));
  }

  assert.match(globalsCss, /@keyframes civic-route-draw/);
  assert.match(globalsCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(globalsCss, /\.civic-product-route__line\s*\{\s*clip-path: none; opacity: 1;/);
});

test("structures the public homepage as the Civic Signal route story", () => {
  const requiredSections = [
    "Your event has a route. <em>Gatherwise shows the next turn.</em>",
    "One event idea. Four legible turns.",
    "Inside a Gatherwise result",
    "Built to refuse guesswork.",
    "Three events. Three different routes.",
    "Planning starts with an idea. <em>Readiness starts with the right route.</em>"
  ];

  for (const section of requiredSections) {
    assert.ok(home.includes(section), `missing homepage section: ${section}`);
  }

  assert.match(home, /listDemoScenarios\(\)\.slice\(0, 3\)/);
  assert.match(home, /36 evaluation scenarios/);
  assert.doesNotMatch(home, /^"use client";/m);
});

function escapeToken(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
