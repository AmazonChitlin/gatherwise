import type { ChecklistItem } from "@/lib/rule-engine";

export function groupByJurisdiction(items: ChecklistItem[]) {
  const groups = new Map<string, ChecklistItem[]>();

  for (const item of items) {
    const current = groups.get(item.jurisdiction) ?? [];
    current.push(item);
    groups.set(item.jurisdiction, current);
  }

  return Array.from(groups.entries()).map(([jurisdiction, groupItems]) => ({
    jurisdiction,
    items: sortByLeadTime(groupItems)
  }));
}

export function sortByLeadTime(items: ChecklistItem[]) {
  return [...items].sort((left, right) => {
    return right.leadTimeDays - left.leadTimeDays || left.title.localeCompare(right.title);
  });
}

export function topItemsToCheckFirst(items: ChecklistItem[], limit = 4) {
  return [...items].sort(sortByUrgencyAndLeadTime).slice(0, limit);
}

export function formatTimeline(items: ChecklistItem[]) {
  const leadTimes = Array.from(
    new Set(
      items
        .map((item) => item.leadTimeDays)
        .filter((leadTime) => leadTime > 0)
        .sort((left, right) => right - left)
    )
  );

  if (leadTimes.length === 0) {
    return ["No timeline items matched yet. Confirm timing with the agency."];
  }

  return leadTimes.map((leadTime) => {
    const count = items.filter((item) => item.leadTimeDays === leadTime).length;
    return `Start checking ${leadTime} days before the event for ${count} matched item${
      count === 1 ? "" : "s"
    }.`;
  });
}

export function formatRequirementLevel(level: ChecklistItem["requirementLevel"]) {
  if (level === "likely required") {
    return "Likely required";
  }

  if (level === "may be required") {
    return "May be required";
  }

  return "Confirm with agency";
}

export function formatConfidence(confidence: ChecklistItem["confidence"]) {
  if (confidence === "high") {
    return "High confidence";
  }

  if (confidence === "medium") {
    return "Medium confidence";
  }

  return "Low confidence";
}

export function formatVerificationStatus(
  status: ChecklistItem["verificationStatus"]
) {
  if (status === "verified") {
    return "Verified source";
  }

  if (status === "needs_review") {
    return "Needs source review";
  }

  return "Sample placeholder";
}

export function formatVerificationMessage(item: ChecklistItem) {
  if (item.verificationStatus === "verified") {
    return item.lastVerified
      ? `Official source last checked on ${item.lastVerified}. Confirm details with the listed agency before relying on it.`
      : "Official source is marked verified. Confirm details with the listed agency before relying on it.";
  }

  if (item.verificationStatus === "needs_review") {
    return "This item needs source review. Confirm this with the listed agency before relying on it.";
  }

  return "This item is based on sample data and needs official verification. Confirm this with the listed agency before relying on it.";
}

export function buildRedFlags(items: ChecklistItem[]) {
  const flags = [
    "Confirm dates, fees, forms, and final instructions with the relevant agency."
  ];

  if (items.some((item) => item.verificationStatus === "sample_placeholder")) {
    flags.unshift("Sample rules are unverified until official sources are reviewed.");
  }

  if (items.some((item) => item.leadTimeDays >= 30)) {
    flags.push("At least one matched item has a 30-day planning lead time.");
  }

  if (items.some((item) => item.confidence === "low")) {
    flags.push("One or more matched items are marked low confidence.");
  }

  if (items.some((item) => item.verificationStatus !== "verified")) {
    flags.push("One or more matched items need official verification.");
  }

  return flags;
}

function sortByUrgencyAndLeadTime(left: ChecklistItem, right: ChecklistItem) {
  return (
    requirementRank(left.requirementLevel) - requirementRank(right.requirementLevel) ||
    right.leadTimeDays - left.leadTimeDays ||
    jurisdictionRank(left.jurisdictionType) - jurisdictionRank(right.jurisdictionType) ||
    left.title.localeCompare(right.title)
  );
}

function requirementRank(level: ChecklistItem["requirementLevel"]) {
  if (level === "likely required") {
    return 0;
  }

  if (level === "may be required") {
    return 1;
  }

  return 2;
}

function jurisdictionRank(type: ChecklistItem["jurisdictionType"]) {
  if (type === "city") {
    return 0;
  }

  if (type === "county") {
    return 1;
  }

  if (type === "state") {
    return 2;
  }

  return 3;
}
