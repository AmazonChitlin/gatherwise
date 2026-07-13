import assert from "node:assert/strict";
import test from "node:test";
import { futurePaidProducts } from "@/lib/future-products";

test("future paid product copy is clearly non-functional", () => {
  for (const product of futurePaidProducts) {
    assert.match(product.status, /future|coming soon/i);
    assert.match(product.status, /not active/i);
    assert.doesNotMatch(product.description, /buy now|checkout|purchase/i);
  }
});
