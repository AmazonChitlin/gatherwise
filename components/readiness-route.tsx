"use client";

import { useState, useTransition } from "react";
import { Badge, Card } from "@/components/ui";
import type { EventFactsDocument } from "@/lib/event-facts";
import type { ReadinessRouteNode, RequirementComparison, SimulatorChangeSet } from "@/lib/readiness-route";

type SimulationResponse = {
  route: ReadinessRouteNode[];
  comparison: RequirementComparison;
};

export function ReadinessRouteExperience({
  initialEventFacts,
  initialRoute
}: {
  initialEventFacts: EventFactsDocument;
  initialRoute: ReadinessRouteNode[];
}) {
  const [route, setRoute] = useState(initialRoute);
  const [comparison, setComparison] = useState<RequirementComparison | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [changes, setChanges] = useState<SimulatorChangeSet>({
    city: initialEventFacts.locationScope.cityCode ?? "phoenix",
    propertyUse: initialEventFacts.locationScope.propertyUse ?? "private-property",
    expectedAttendance:
      typeof initialEventFacts.facts.find((fact) => fact.key === "expectedAttendance")?.value ===
      "number"
        ? (initialEventFacts.facts.find((fact) => fact.key === "expectedAttendance")
            ?.value as number)
        : 100,
    vendorCount:
      typeof initialEventFacts.facts.find((fact) => fact.key === "vendorCount")?.value ===
      "number"
        ? (initialEventFacts.facts.find((fact) => fact.key === "vendorCount")?.value as number)
        : 1,
    hasFood:
      initialEventFacts.facts.find((fact) => fact.key === "hasFood")?.value === true,
    hasAlcohol:
      initialEventFacts.facts.find((fact) => fact.key === "hasAlcohol")?.value === true,
    hasAmplifiedSound:
      initialEventFacts.facts.find((fact) => fact.key === "hasAmplifiedSound")?.value === true,
    hasStreetSidewalkOrParkingImpact:
      initialEventFacts.facts.find(
        (fact) => fact.key === "hasStreetSidewalkOrParkingImpact"
      )?.value === true,
    streetClosure:
      initialEventFacts.facts.find((fact) => fact.key === "streetClosure")?.value === true
  });

  function updateBoolean(key: keyof SimulatorChangeSet, checked: boolean) {
    setChanges((current) => ({ ...current, [key]: checked }));
  }

  function updateText(
    key: keyof SimulatorChangeSet,
    value: string | number
  ) {
    setChanges((current) => ({ ...current, [key]: value }));
  }

  function resetSimulation() {
    setRoute(initialRoute);
    setComparison(null);
    setError(null);
  }

  async function handleSubmit(formData: FormData) {
    const payload: SimulatorChangeSet = {
      city: String(formData.get("city") ?? changes.city ?? "phoenix"),
      propertyUse: String(
        formData.get("propertyUse") ?? changes.propertyUse ?? "private-property"
      ),
      expectedAttendance: Number(formData.get("expectedAttendance") ?? 100),
      vendorCount: Number(formData.get("vendorCount") ?? 1),
      hasFood: formData.get("hasFood") === "true",
      hasAlcohol: formData.get("hasAlcohol") === "true",
      hasAmplifiedSound: formData.get("hasAmplifiedSound") === "true",
      hasStreetSidewalkOrParkingImpact:
        formData.get("hasStreetSidewalkOrParkingImpact") === "true",
      streetClosure: formData.get("streetClosure") === "true"
    };

    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/results/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventFacts: initialEventFacts,
            changes: payload
          })
        });

        if (!response.ok) {
          throw new Error("We could not compare that route change yet.");
        }

        const result = (await response.json()) as SimulationResponse;
        setRoute(result.route);
        setComparison(result.comparison);
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "We could not compare that route change yet."
        );
      }
    });
  }

  return (
    <div className="gw-readiness-shell">
      <section aria-labelledby="readiness-route" className="gw-readiness-main">
        <Card className="p-5">
          <Badge tone="highlight">Readiness Route</Badge>
          <h2
            className="mt-4 text-2xl font-black tracking-[-0.02em]"
            id="readiness-route"
          >
            Follow the deterministic route
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            This route stays readable as a normal vertical list on small
            screens, with reduced motion, and when scripts are limited.
          </p>
          <div className="gw-readiness-route-shell mt-4">
            <div className="gw-readiness-route-line" aria-hidden="true" />
            {route.map((node) => (
              <details
                className="gw-readiness-route-stop"
                key={node.id}
                open={node.kind === "start" || node.kind === "end"}
              >
                <summary className="focus-ring min-h-[44px] cursor-pointer list-none rounded-[var(--radius-card)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={tokenClassName(node.token)}>
                      {tokenLabel(node.kind)}
                    </span>
                    {node.sourceId ? (
                      <Badge tone="neutral">Source ID: {node.sourceId}</Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{node.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {node.summary}
                  </p>
                </summary>
                <div className="mt-4 space-y-2">
                  {node.detailLines.map((line) => (
                    <p className="text-sm leading-6 text-[var(--muted)]" key={line}>
                      {line}
                    </p>
                  ))}
                  {node.sourceUrl ? (
                    <a
                      className="focus-ring inline-flex min-h-[44px] items-center text-sm font-semibold underline"
                      href={node.sourceUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Check the official source
                    </a>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        </Card>
      </section>

      <aside aria-labelledby="change-simulator" className="gw-readiness-side">
        <Card className="p-5">
          <Badge tone="secondary">Event Change Simulator</Badge>
          <h2
            className="mt-4 text-2xl font-black tracking-[-0.02em]"
            id="change-simulator"
          >
            Compare one route change
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Duplicate the confirmed event facts, change one or more supported
            details, and compare the deterministic difference.
          </p>
          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit(new FormData(event.currentTarget));
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                City
                <select
                  className="focus-ring min-h-[44px] rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3"
                  defaultValue={String(changes.city ?? "phoenix")}
                  name="city"
                  onChange={(event) => updateText("city", event.target.value)}
                >
                  <option value="phoenix">Phoenix</option>
                  <option value="tempe">Tempe</option>
                  <option value="mesa">Mesa</option>
                  <option value="scottsdale">Scottsdale</option>
                  <option value="glendale">Glendale</option>
                  <option value="peoria">Peoria</option>
                  <option value="chandler">Chandler</option>
                  <option value="gilbert">Gilbert</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Property type
                <select
                  className="focus-ring min-h-[44px] rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3"
                  defaultValue={String(changes.propertyUse ?? "private-property")}
                  name="propertyUse"
                  onChange={(event) => updateText("propertyUse", event.target.value)}
                >
                  <option value="private-property">Private property</option>
                  <option value="parking-lot">Parking lot or outdoor private space</option>
                  <option value="public-property">Public property</option>
                  <option value="park-or-plaza">Park or plaza</option>
                  <option value="licensed-venue">Existing licensed venue</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Expected attendance
                <input
                  className="focus-ring min-h-[44px] rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3"
                  defaultValue={Number(changes.expectedAttendance ?? 100)}
                  min={1}
                  name="expectedAttendance"
                  onChange={(event) =>
                    updateText("expectedAttendance", Number(event.target.value))
                  }
                  type="number"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Vendor count
                <input
                  className="focus-ring min-h-[44px] rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3"
                  defaultValue={Number(changes.vendorCount ?? 1)}
                  min={1}
                  name="vendorCount"
                  onChange={(event) =>
                    updateText("vendorCount", Number(event.target.value))
                  }
                  type="number"
                />
              </label>
            </div>

            <fieldset className="grid gap-3">
              <legend className="text-sm font-semibold">Quick route toggles</legend>
              <ToggleField
                checked={Boolean(changes.hasFood)}
                label="Food involved"
                name="hasFood"
                onChange={(checked) => updateBoolean("hasFood", checked)}
              />
              <ToggleField
                checked={Boolean(changes.hasAlcohol)}
                label="Alcohol involved"
                name="hasAlcohol"
                onChange={(checked) => updateBoolean("hasAlcohol", checked)}
              />
              <ToggleField
                checked={Boolean(changes.hasAmplifiedSound)}
                label="Amplified sound"
                name="hasAmplifiedSound"
                onChange={(checked) => updateBoolean("hasAmplifiedSound", checked)}
              />
              <ToggleField
                checked={Boolean(changes.hasStreetSidewalkOrParkingImpact)}
                label="Street, sidewalk, or parking impact"
                name="hasStreetSidewalkOrParkingImpact"
                onChange={(checked) =>
                  updateBoolean("hasStreetSidewalkOrParkingImpact", checked)
                }
              />
              <ToggleField
                checked={Boolean(changes.streetClosure)}
                label="Street closure"
                name="streetClosure"
                onChange={(checked) => updateBoolean("streetClosure", checked)}
              />
            </fieldset>

            <div className="flex flex-wrap gap-3">
              <button
                className="local-button min-h-[44px] bg-[var(--primary)] px-4 text-white"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Comparing route..." : "Compare route change"}
              </button>
              <button
                className="local-button min-h-[44px] border border-[var(--line-strong)] bg-[var(--surface)] px-4"
                onClick={resetSimulation}
                type="button"
              >
                Reset comparison
              </button>
            </div>
          </form>

          <div aria-live="polite" className="mt-4">
            {error ? (
              <p className="gw-inline-error">{error}</p>
            ) : null}
            {comparison ? <ComparisonSummary comparison={comparison} /> : null}
          </div>
        </Card>
      </aside>
    </div>
  );
}

function ComparisonSummary({ comparison }: { comparison: RequirementComparison }) {
  const groups = [
    ["Added requirements", comparison.addedRequirements],
    ["Removed requirements", comparison.removedRequirements],
    ["Changed warnings", comparison.changedWarnings],
    ["Unchanged requirements", comparison.unchangedRequirements],
    ["Newly unresolved requirements", comparison.newlyUnresolvedRequirements]
  ] as const;

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-muted)] p-4">
        <h3 className="text-base font-semibold">Deterministic route difference</h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted)]">
          {comparison.changedFactLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
      {groups.map(([label, items]) => (
        <section
          className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-muted)] p-4"
          key={label}
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">{label}</h3>
            <Badge tone="neutral">{items.length}</Badge>
          </div>
          {items.length === 0 ? (
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              No items in this comparison group.
            </p>
          ) : (
            <ul className="mt-3 space-y-3 text-sm leading-6">
              {items.map((item) => (
                <li key={`${label}:${item.ruleId}`}>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-[var(--muted)]">{item.explanation}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

function ToggleField({
  checked,
  label,
  name,
  onChange
}: {
  checked: boolean;
  label: string;
  name: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-[44px] items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold">
      <span>{label}</span>
      <select
        className="focus-ring min-h-[44px] rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3"
        defaultValue={checked ? "true" : "false"}
        name={name}
        onChange={(event) => onChange(event.target.value === "true")}
      >
        <option value="false">No</option>
        <option value="true">Yes</option>
      </select>
    </label>
  );
}

function tokenClassName(token: ReadinessRouteNode["token"]) {
  if (token === "official") {
    return "gw-source-token gw-source-token-official";
  }

  return token === "unknown"
    ? "gw-route-stop-token gw-route-stop-unknown"
    : "gw-route-stop-token gw-route-stop-verified";
}

function tokenLabel(kind: ReadinessRouteNode["kind"]) {
  switch (kind) {
    case "start":
      return "Start";
    case "fact":
      return "Fact marker";
    case "decision":
      return "Decision point";
    case "requirement":
      return "Requirement stop";
    case "missing":
      return "Missing-information fork";
    case "source":
      return "Source anchor";
    case "end":
      return "End state";
  }
}
