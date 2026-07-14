import { Buffer } from "node:buffer";
import {
  intakeToEventFacts,
  parseStoredIntakePayload,
  serializeStoredIntakePayload,
  type StoredIntakePayload
} from "@/lib/event-facts";
import type { IntakeInput } from "@/lib/schemas";

export const MAX_RESULTS_SNAPSHOT_BYTES = 12_000;

export function shouldPersistIntakeSubmissions() {
  const configured = process.env.PERSIST_INTAKE_SUBMISSIONS;

  if (configured === "true") {
    return true;
  }

  if (configured === "false") {
    return false;
  }

  return process.env.NODE_ENV !== "production";
}

export function createResultsSnapshot(intake: IntakeInput) {
  const payload = serializeStoredIntakePayload(intake, intakeToEventFacts(intake));
  const bytes = Buffer.byteLength(payload, "utf8");

  if (bytes > MAX_RESULTS_SNAPSHOT_BYTES) {
    throw new Error("Snapshot payload exceeds safe URL size.");
  }

  return Buffer.from(payload, "utf8").toString("base64url");
}

export function parseResultsSnapshot(snapshot: string): StoredIntakePayload | null {
  try {
    const decoded = Buffer.from(snapshot, "base64url").toString("utf8");
    return parseStoredIntakePayload(decoded);
  } catch {
    return null;
  }
}
