import assert from "node:assert/strict";
import test from "node:test";
import { ExtractionRequestGuard } from "@/lib/extraction-request-guard";

test("switching paths aborts and invalidates an in-flight extraction", () => {
  const guard = new ExtractionRequestGuard();
  const request = guard.start();

  guard.invalidate();

  assert.equal(request.controller.signal.aborted, true);
  assert.equal(guard.isCurrent(request), false);
});

test("a stale successful response cannot commit review state", async () => {
  const guard = new ExtractionRequestGuard();
  const request = guard.start();
  let phase = "describe";
  const response = deferred<string>();
  const completion = response.promise.then(() => {
    if (guard.isCurrent(request)) {
      phase = "review";
    }
  });

  guard.invalidate();
  response.resolve("success");
  await completion;

  assert.equal(phase, "describe");
});

test("a stale failure cannot commit an extraction error", async () => {
  const guard = new ExtractionRequestGuard();
  const request = guard.start();
  let error = "";
  const response = deferred<never>();
  const completion = response.promise.catch(() => {
    if (guard.isCurrent(request)) {
      error = "Extraction failed";
    }
  });

  guard.invalidate();
  response.reject(new Error("stale provider failure"));
  await completion;

  assert.equal(error, "");
});

test("retry aborts the old request and starts a fresh generation", () => {
  const guard = new ExtractionRequestGuard();
  const first = guard.start();
  const retry = guard.start();

  assert.equal(first.controller.signal.aborted, true);
  assert.equal(guard.isCurrent(first), false);
  assert.equal(guard.finish(first), false);
  assert.equal(guard.isCurrent(retry), true);
  assert.equal(guard.finish(retry), true);
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}
