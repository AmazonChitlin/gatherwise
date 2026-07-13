import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const globalsCss = readFileSync(
  join(process.cwd(), "app", "globals.css"),
  "utf8"
);

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

function escapeToken(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
